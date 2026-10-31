'use strict';
// summary-pool.js —— 目录大小统计的 Worker 线程池。
//
// 为什么需要它：/api/summary 的底层枚举是同步调用（node-windows-readdir-fast），直接在
// 主事件循环里跑会阻塞整个 Node 进程，导致「汇总一个大目录时，打开另一个路径的 /api/list
// 也卡住」。把它放进 Worker 线程后，主线程始终空闲，可并发响应浏览请求。
//
// 设计：
//   - 默认 1 个 worker（通过环境变量 DSG_SUMMARY_WORKERS 覆盖，最小 1）。
//     选 1 是为了与同步原生模块（readdir-fast）的线程安全保守兼容：单 worker 下不存在
//     多线程并发调用该原生函数的场景；多个汇总请求会在此 worker 上顺序排队，但主线程不受影响。
//   - 若 worker 初始化失败（例如平台不支持 worker_threads、或原生模块在 worker 内加载失败），
//     自动回退到主线程直接调用 runSummary —— 此时行为退化为「会阻塞」，但服务仍然可用。
//   - 若运行中所有 worker 异常退出，则同样回退主线程，并把积压任务排空处理。

const { Worker } = require('worker_threads');
const os = require('os');
const path = require('path');
const { runSummary } = require('./summary-core');

const WORKER_PATH = path.join(__dirname, 'summary-worker.js');
const POOL_SIZE = Math.max(1, parseInt(process.env.DSG_SUMMARY_WORKERS || '1', 10) || 1);

let workers = [];
let queue = [];
let initialized = false;
let useWorker = true;
let aliveCount = 0;

function makeWorker() {
  let w;
  try { w = new Worker(WORKER_PATH); }
  catch (e) { useWorker = false; return null; }
  w._busy = false;
  w._current = null;
  aliveCount++;
  w.on('message', (msg) => {
    const job = w._current;
    if (!job) return;
    w._busy = false;
    w._current = null;
    if (msg.type === 'done') job.resolve(msg.summaries);
    else job.reject(new Error(msg.message || 'summary worker error'));
    pump();
  });
  w.on('exit', (code) => {
    aliveCount--;
    const job = w._current;
    if (job) { job.reject(new Error('summary worker exited (code ' + code + ')')); }
    if (aliveCount <= 0) { useWorker = false; drainToMain(); }
  });
  w.on('error', (err) => {
    // 单个 worker 出错：释放其当前任务（exit 事件随后会递减 aliveCount）。
    const job = w._current;
    if (job) { w._busy = false; w._current = null; job.reject(err); }
  });
  return w;
}

function init() {
  if (initialized) return;
  initialized = true;
  for (let i = 0; i < POOL_SIZE; i++) {
    const w = makeWorker();
    if (w) workers.push(w);
  }
  if (!workers.length) useWorker = false; // 一个都没建起来 → 直接走主线程回退
}

function freeWorker() {
  return workers.find((w) => !w._busy) || null;
}

function pump() {
  if (!queue.length) return;
  const w = freeWorker();
  if (!w) return; // 全部忙碌，等某个 worker 回来再 pump
  const job = queue.shift();
  w._busy = true;
  w._current = job;
  w.postMessage({ paths: job.paths });
}

// 所有 worker 都挂了：把积压任务在主线程上排空（会阻塞主线程，但属降级路径，极少触发）。
function drainToMain() {
  while (queue.length) {
    const job = queue.shift();
    runSummary(job.paths).then(job.resolve, job.reject);
  }
}

// 对外入口：返回 Promise<summaries>。
async function run(paths) {
  init();
  if (!useWorker || !workers.length) {
    return runSummary(paths); // 回退：主线程直接算
  }
  return new Promise((resolve, reject) => {
    queue.push({ paths, resolve, reject });
    pump();
  });
}

module.exports = { run, POOL_SIZE };
