'use strict';
// summary-worker.js —— 在独立 Worker 线程里执行目录大小统计。
//
// 主线程把「要统计的根路径列表」发过来，本 worker 调用 summary-core.runSummary 完成
// 递归枚举 + 累计（其中 node-windows-readdir-fast 是同步调用，会阻塞本 worker 线程），
// 再把结果回传主线程。这样无论汇总多大目录，都不会阻塞 HTTP 服务的主事件循环——
// 用户在「汇总一个大目录」的同时，仍能正常打开/浏览其它路径（/api/list）。
const { parentPort } = require('worker_threads');
const { runSummary } = require('./summary-core');

parentPort.on('message', async (msg) => {
  try {
    const summaries = await runSummary((msg && msg.paths) || []);
    parentPort.postMessage({ type: 'done', summaries });
  } catch (err) {
    parentPort.postMessage({ type: 'error', message: (err && err.message) ? err.message : String(err) });
  }
});
