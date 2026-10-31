'use strict';
// summary-core.js —— 目录大小统计的纯逻辑（与 HTTP 服务解耦，可在 Worker 线程中运行）。
//
// 背景：/api/summary 需要递归枚举整棵子树并累计文件数 / 总大小。枚举用的是
// node-windows-readdir-fast（同步 N-API）；同步调用会阻塞「调用线程」。为了让主事件循环
// 在「汇总大目录 / 整盘」时仍能响应其它请求（如打开另一个路径的 /api/list），这段逻辑被
// 抽到本模块，由 summary-pool.js 在 Worker 线程里执行，主线程只负责收结果、拼响应。
//
// 本模块零外部依赖（仅依赖可选的 node-windows-readdir-fast，缺失时自动回退原生 fs）。

const fs = require('fs');
const path = require('path');
const fastEnum = require('./fast-enum');

const VOLUME_MARKER = '.dir-struct-id';

// 给 Promise 加超时；超时抛错。用于兜住极慢 / 不可达目录，避免线程被拖死。
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
  ]);
}

// 目录大小统计的读取参数与容错策略。
// 历史缺陷：readdir 一次 4 秒超时就把整棵子树记成 {fileCount:0,totalSize:0}，慢盘或海量小文件的
// 目录会静默变成 0，父目录随之偏小。现在改为「按更长超时重试」，仍读不到才标记不完整。
const SUMMARY_READDIR_TIMEOUT_MS = 20000;
const SUMMARY_READDIR_RETRY = 2;   // 超时后的额外重试次数（最多 1 + 2 次尝试）
const SUMMARY_STAT_TIMEOUT_MS = 10000;
const SUMMARY_MAX_DEPTH = 512;     // 递归深度上限：超过即标记不完整，不再返回 0 冒充真实值

// 「占用磁盘空间」的取值口径。
// POSIX 下 stat 的 st_blocks 是「512 字节块」的数量（与 blksize 无关），乘 512 即实际分配字节；
// 取不到时返回 null，由调用方按「用该文件的逻辑大小替代」处理（Windows 下 Node/libuv 不提供
// st_blocks；簇对齐、压缩、稀疏、去重、云占位等也会让占用量与逻辑大小不同，属正常）。
const ALLOC_BLOCK_UNIT = 512;
function allocBytesOf(st) {
  if (process.platform === 'win32') return null;
  if (st && typeof st.blocks === 'number' && isFinite(st.blocks) && st.blocks >= 0) {
    return st.blocks * ALLOC_BLOCK_UNIT;
  }
  return null;
}

// 把 stat 结果规整成清单要的两个数值：逻辑大小与占用磁盘空间（占用取不到 → 用逻辑大小替代）。
function sizePairOf(st) {
  const size = st && typeof st.size === 'number' ? st.size : 0;
  const alloc = allocBytesOf(st);
  return { size, sizeOnDisk: alloc == null ? size : alloc };
}

// 读取目录项；只在「超时」时重试（权限错误、路径不存在等重试无意义，直接判定读不到）。
// 返回 dirents 数组，或 null 表示确实读不到（调用方必须标记不完整，不得记 0）。
async function readdirForSummary(p) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await withTimeout(fs.promises.readdir(p, { withFileTypes: true }), SUMMARY_READDIR_TIMEOUT_MS);
    } catch (err) {
      const isTimeout = !!(err && err.message === 'timeout');
      if (!isTimeout || attempt >= SUMMARY_READDIR_RETRY) return null;
    }
  }
}

// 取单个文件/链接的状态（带超时，避免单个卡死的文件把整棵子树的统计拖住）。
function statForSummary(p) {
  return withTimeout(fs.promises.stat(p), SUMMARY_STAT_TIMEOUT_MS);
}

// 读取某目录的「一层直接子项」，并尽量带回每个文件的大小。
// 返回数组 [{ name, isDirectory, size, sizeOnDisk, symlink, partial }] 或 null（确实读不到）。
// 两种实现：
//   - 快速路径（fastEnum.available，仅 Windows 且已装包）：readdirFastSync(dir,false) 一次系统调用
//     拿到全部直接子项与文件 length，零 stat；重新分析点(符号链接/junction)按属性标记 symlink 交回调用方 stat 解析。
//   - 原生回退（其他平台 / 未装包）：readdirForSummary(带超时重试) + 按需对文件 stat，行为与历史版本一致。
// needSizes=true 时原生回退才对每个文件 stat 取大小（避免纯浏览时不必要的 stat）；快速路径大小免费、始终带回。
async function readdirOneLevel(dir, needSizes) {
  if (fastEnum.available) {
    try {
      const gen = fastEnum.readdirFastSync(dir, false); // 单层，非递归
      const out = [];
      for (const e of gen) {
        if (e.name === '.' || e.name === '..') continue;
        if (e.name === VOLUME_MARKER) continue; // 跳过磁盘身份标记文件
        const reparse = (e.attributes & 0x400) !== 0; // FILE_ATTRIBUTE_REPARSE_POINT
        const isDir = !!e.isDirectory;               // 真实目录 + junction 均为 true
        const isLink = reparse && !isDir;            // 真正的符号链接（可能指向文件或目录），需 stat 解析
        const len = (typeof e.length === 'number' && e.length >= 0) ? e.length : 0;
        out.push({ name: e.name, isDirectory: isDir, size: len, sizeOnDisk: len, symlink: isLink });
      }
      return out;
    } catch (_) { /* 快速路径失败：回退原生，保证可用 */ }
  }
  // 原生回退
  const dirents = await readdirForSummary(dir);
  if (!dirents) return null;
  const out = [];
  for (const e of dirents) {
    if (e.name === VOLUME_MARKER) continue;
    if (e.isDirectory()) {
      out.push({ name: e.name, isDirectory: true, size: 0, sizeOnDisk: 0, symlink: false, partial: false });
    } else if (e.isSymbolicLink()) {
      let isDir = false, size = 0, sizeOnDisk = 0, entryPartial = false;
      try {
        const st = await statForSummary(path.join(dir, e.name));
        isDir = st.isDirectory();
        if (!isDir) { const pair = sizePairOf(st); size = pair.size; sizeOnDisk = pair.sizeOnDisk; }
      } catch (_) { entryPartial = true; /* 链接不可达：标记不完整 */ }
      out.push({ name: e.name, isDirectory: isDir, size, sizeOnDisk, symlink: true, partial: entryPartial });
    } else {
      let size = 0, sizeOnDisk = 0, entryPartial = false;
      if (needSizes) {
        try {
          const pair = sizePairOf(await statForSummary(path.join(dir, e.name)));
          size = pair.size; sizeOnDisk = pair.sizeOnDisk;
        } catch (_) { entryPartial = true; /* 取不到数值：记 0 并标记不完整 */ }
      }
      out.push({ name: e.name, isDirectory: false, size, sizeOnDisk, symlink: false, partial: entryPartial });
    }
  }
  return out;
}

// 递归统计某目录下「全部文件（含子孙）」的数量与总大小（字节）。
// 一次性遍历整棵子树，把所有目录的绝对路径 → {fileCount, totalSize} 写进 acc，
// 前端只需对每块盘根调用一次，即可拿到其下每个目录的汇总，避免按选中目录逐个重复扫描。
// 循环防护：用真实路径集合防止符号链接 / junction 造成的死循环；depth 上限兜底。
// realpathSums：跨根共享的「真实路径 -> 聚合对象」表。遇到符号链接 / junction 指向同一物理
// 目录时，直接复用其聚合对象（原地更新）并以「原始路径」为键写入 acc，既不重复扫描磁盘，
// 也保证前端树里每个节点（含链接、含指向正在统计中的祖先的链接）都能查到大小，不再漏记。
//
// 完整性口径（重要）：
//   - 目录大小 = 该目录整棵物理子树里所有文件的逻辑大小之和，与「是否被单独勾选 / 单独展示」无关。
//   - 读不到（超时重试后仍失败、权限不足）或触到递归深度上限时，**绝不把该子树记成 0**：
//     返回已统计到的部分作为下界，并打上 partial 标记，由父目录逐层向上传播；
//     前端与读取侧据此知道该数值只是下界（见 dir-struct-manifest-format.md）。
async function summarizeTree(p, visited, depth, acc, realpathSums) {
  let rp;
  try { rp = await fs.promises.realpath(p); } catch (_) { rp = p; }
  // 真实路径已被统计过（或正在统计中）：复用同一个聚合对象（引用共享，算完原地更新），
  // 仍以原始路径为键记录，避免漏记 + 避免重复扫盘（含指向祖先的 junction 自引用场景）。
  if (realpathSums && realpathSums.has(rp)) {
    const existing = realpathSums.get(rp);
    if (acc && p) acc.set(p, existing);
    return existing;
  }
  if (visited.has(rp)) {
    if (acc && p) acc.set(p, { fileCount: 0, totalSize: 0, totalSizeOnDisk: 0 });
    return { fileCount: 0, totalSize: 0, totalSizeOnDisk: 0 };
  }
  visited.add(rp);
  // 先放占位对象并登记到 realpathSums：这样指向本目录的 junction / 祖先自引用可复用同一个对象，
  // 待下方算完后原地更新其值（引用共享），无需重复扫盘也不漏记，且无环。
  // 两个数值：totalSize = 逻辑大小之和；totalSizeOnDisk = 占用磁盘空间之和
  // （某个文件取不到占用量时，用它的逻辑大小替代）。
  const summary = { fileCount: 0, totalSize: 0, totalSizeOnDisk: 0 };
  if (realpathSums) realpathSums.set(rp, summary);
  // 深度超限：不再返回 0 冒充真实值（否则父目录会凭空偏小），标记不完整后向上传播。
  if (depth > SUMMARY_MAX_DEPTH) {
    summary.partial = true;
    if (acc && p) acc.set(p, summary);
    visited.delete(rp);
    return summary;
  }
  // 单层枚举该目录的直接子项，并尽量带回每个文件的大小（快速路径零 stat；原生回退按需 stat）。
  // 保留原 readdirForSummary 的「读不到即标记不完整、绝不记 0」口径。
  const ents = await readdirOneLevel(p, true);
  if (!ents) {
    // 读不到（快速路径异常回退后仍失败 / 超时重试后仍失败 / 权限不足等）：
    // 保留已统计到的下界并标记不完整，绝不静默记 0。
    summary.partial = true;
    if (acc && p) acc.set(p, summary);
    visited.delete(rp);
    return summary;
  }
  let fileCount = 0, totalSize = 0, totalSizeOnDisk = 0, partial = false;
  const dirJobs = [];
  const linkJobs = [];
  for (const e of ents) {
    if (e.isDirectory) {
      dirJobs.push(summarizeTree(path.join(p, e.name), visited, depth + 1, acc, realpathSums));
    } else if (e.symlink) {
      // 符号链接 / junction 链接：先判定是否指向目录，再决定是否下钻（避免对文件链接误判）。
      linkJobs.push((async () => {
        try {
          if ((await statForSummary(path.join(p, e.name))).isDirectory()) {
            return summarizeTree(path.join(p, e.name), visited, depth + 1, acc, realpathSums);
          }
          return { fileCount: 0, totalSize: 0, totalSizeOnDisk: 0 };
        } catch (_) {
          // 链接不可达：不当作 0，标记不完整
          return { fileCount: 0, totalSize: 0, totalSizeOnDisk: 0, partial: true };
        }
      })());
    } else {
      // 普通文件：累计数量与大小。快速路径下 size/sizeOnDisk 已在单次枚举里带回，无需再 stat；
      // 原生回退下由 readdirOneLevel 按需 stat 取（取不到则记 0 并标记 partial）。
      fileCount += 1;
      totalSize += e.size;
      totalSizeOnDisk += e.sizeOnDisk;
      if (e.partial) partial = true; // 个别文件 stat 失败 → 本目录总量只是下界
    }
  }
  const [subs, linkRes] = await Promise.all([Promise.all(dirJobs), Promise.all(linkJobs)]);
  for (const s of subs) {
    fileCount += s.fileCount;
    totalSize += s.totalSize;
    totalSizeOnDisk += (typeof s.totalSizeOnDisk === 'number' ? s.totalSizeOnDisk : s.totalSize);
    if (s.partial) partial = true; // 子树里有一处不完整 → 本目录的总量同样只是下界
  }
  for (const s of linkRes) {
    if (s && s.partial) partial = true;
    else {
      fileCount += s.fileCount;
      totalSize += s.totalSize;
      totalSizeOnDisk += (typeof s.totalSizeOnDisk === 'number' ? s.totalSizeOnDisk : s.totalSize);
    }
  }
  // 原地更新占位对象（所有复用方通过引用同步拿到最终值），并按原始路径记录。
  summary.fileCount = fileCount;
  summary.totalSize = totalSize;
  summary.totalSizeOnDisk = totalSizeOnDisk;
  if (partial) summary.partial = true; else delete summary.partial;
  if (acc && p) acc.set(p, summary);
  visited.delete(rp);
  return summary;
}

// 一次性统计多个根目录，返回 { 绝对路径: {fileCount,totalSize,totalSizeOnDisk?,partial?} }。
// 跨根共享 realpathSums（相同物理目录只统计一次），单个根失败不影响其他根。
async function runSummary(paths) {
  const acc = new Map();
  const realpathSums = new Map();
  for (const p of (paths || [])) {
    try { await summarizeTree(p, new Set(), 0, acc, realpathSums); }
    catch (_) { /* 单个根扫描失败不影响其他根 */ }
  }
  const summaries = {};
  for (const [k, v] of acc) summaries[k] = v;
  return summaries;
}

module.exports = { runSummary, summarizeTree, statForSummary, sizePairOf, allocBytesOf, VOLUME_MARKER };
