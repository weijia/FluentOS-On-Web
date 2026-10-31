'use strict';
// 可选的目录枚举加速封装。
//
// 背景：dir-struct-gen 默认零依赖，用 Node 原生 fs 递归列举目录、并对每个文件 stat 取大小，
// 在「计算目录总大小(/api/summary)」这类场景会因「逐文件 stat 风暴」明显变慢。
// `node-windows-readdir-fast` 是原生 N-API 模块，仅在 Windows(win32) 上可用：它在一次系统调用里
// 枚举某目录的直接子项，并直接带回每个文件的大小(length)，从而省掉 stat。
//
// 本模块在启动时尝试加载该包：
//   - 加载成功（Windows 且已 `npm install node-windows-readdir-fast`）→ available=true，调用方走快速路径；
//   - 平台非 win32、包未安装、或加载失败 → available=false，调用方回退到原生 fs 实现，行为与历史版本一致。
//
// 这样 dir-struct-gen 在「未安装该包」时依旧零依赖、跨平台可用；装上包后自动获得加速。

let readdirFastSync = null;
let available = false;

if (process.platform === 'win32') {
  try {
    const mod = require('node-windows-readdir-fast');
    readdirFastSync = (mod && (mod.readdirFastSync || (mod.default && mod.default.readdirFastSync))) || null;
    if (typeof readdirFastSync === 'function') available = true;
  } catch (_) {
    available = false;
    readdirFastSync = null;
  }
}

// available: 是否启用快速枚举（Windows 且包可用）
// readdirFastSync: 底层同步函数 (dir, recurse) => Generator<DirentStats>，recurse=false 仅列直接子项。
//   DirentStats: { name, parentPath, isDirectory, attributes, length, birthtimeMs, mtimeMs }
module.exports = { available, readdirFastSync };
