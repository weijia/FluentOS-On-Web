'use strict';
/*
 * mft-bench.js —— 直接用 NTFS $MFT 枚举目录子树并计时
 *
 * 原理：
 *   1. 以管理员身份打开 \\.\C: 读取引导扇区，正确位置拿到：
 *        - 每扇区字节数(0x0B) / 每簇扇区数(0x0D)
 *        - MFT 起始簇号 LCN（偏移 0x20，8 字节）
 *        - MFT 记录大小（偏移 0x30，1 字节带符号；<0 表示 2^(-v) 字节）
 *   2. 读 $MFT 的「第 0 号记录」（MFT 自身的 base record），解析其 $DATA(0x80)
 *      非驻留属性的 data runs（数据游程），得到 MFT 文件在卷上真实的
 *      「(物理簇, 簇数)」片段列表——这才是正确的、覆盖整个 MFT 的读取方式，
 *      不受稀疏/碎片影响（直接打开 \\.\C::$MFT 流在本机会 ENOENT，故读原始卷）。
 *   3. 逐片段读取并解析 FILE 记录：
 *        - 应用 update-sequence fixup（多扇区记录的完整性修复）；
 *        - 取 $FILE_NAME(0x30) 得到「父目录引用 + 文件名 + 是否目录 + 文件大小」；
 *        - 取 $DATA(0x80) 的文件大小作为更权威的字节数（覆盖 $FILE_NAME 的值）。
 *   4. 用 memoized 路径重建（按父引用往上爬），过滤出目标前缀的子树，
 *      统计 文件数 / 目录数 / 总大小。
 *
 * 注意：
 *   - 必须「以管理员身份运行」（否则打开 \\.\C: 会失败）。
 *   - 它枚举的是「整块卷的 MFT」再按路径过滤，开销 = 扫整卷 MFT，
 *     对小子树不一定比定向 readdir 快——这正是要和 readdir-fast 对比的点。
 *
 * 用法（管理员终端）：
 *   node mft-bench.js                       # 默认卷 C，目录 C:\codes\方正证券\小方
 *   node mft-bench.js D "D:\some\folder"    # 指定卷与目录
 */

const fs = require('fs');

const VOLUME = (process.argv[2] || 'C').replace(/:$/, '').toUpperCase();
const TARGET = (process.argv[3] || 'C:\\codes\\方正证券\\小方').replace(/\//g, '\\');
// MFT 重建出的路径是「卷内相对路径」（不含盘符，例如 CODES\方正证券\小方），
// 所以把目标也转成卷内相对路径并大写，方便直接比较。
let TARGET_UP = TARGET.toUpperCase().replace(/^[A-Z]:\\?/, '').replace(/^\\+/, '').replace(/\\+$/, '');

const t0 = Date.now();

// ---------- 1. 引导扇区 ----------
let volFd;
try {
  volFd = fs.openSync('\\\\.\\' + VOLUME + ':', 'r');
} catch (e) {
  console.error('无法打开 \\\\.\\' + VOLUME + ': —— 请确认「以管理员身份运行」此脚本。');
  console.error('错误:', e.code || e.message);
  process.exit(1);
}
const boot = Buffer.alloc(512);
fs.readSync(volFd, boot, 0, 512, 0);
// 不关闭 volFd：后面直接用这个原始卷句柄去读 MFT 各片段

if (boot.toString('ascii', 3, 7) !== 'NTFS') {
  console.error('卷 ' + VOLUME + ': 不是 NTFS（magic=' + boot.toString('ascii', 3, 11) + '），脚本仅支持 NTFS。');
  process.exit(1);
}
const bytesPerSector = boot.readUInt16LE(0x0B);
const sectorsPerCluster = boot.readUInt8(0x0D);
const bytesPerCluster = bytesPerSector * sectorsPerCluster;

// 注意：MFT 起始 LCN 在引导扇区偏移 0x20（8 字节），不是 0x30。
const mftStartLcn = boot.readUInt32LE(0x20) + boot.readUInt32LE(0x24) * 0x100000000;

// 注意：记录大小在偏移 0x30（1 字节带符号），不是 0x40。
//   >= 0  → 该值 * 每簇字节数； < 0 → 2^(-值) 字节。
const cfr = boot.readInt8(0x30);
const recordSize = cfr > 0 ? cfr * bytesPerCluster : (1 << (-cfr));

// ---------- 2. 通用工具：fixup / 属性游程 ----------
function applyFixup(rec, bps) {
  const usnOff = rec.readUInt16LE(0x04);
  const usnCount = rec.readUInt16LE(0x06);
  if (usnOff === 0 || usnCount === 0) return;
  let p = usnOff + 2;
  const sectors = recordSize / bps;
  for (let i = 1; i < usnCount && i <= sectors; i++) {
    const pos = (i - 1) * bps + (bps - 2);
    const replacement = rec.readUInt16LE(p);
    rec.writeUInt16LE(replacement, pos);
    p += 2;
  }
}

// 解析一个 FILE 记录里 $DATA(0x80) 非驻留属性的 data runs，返回 [{lcn, clusters}]
function parseDataRuns(rec) {
  const attrOffset = rec.readUInt16LE(0x14);
  let off = attrOffset;
  const runs = [];
  while (off + 4 <= recordSize) {
    const attrType = rec.readUInt32LE(off);
    if (attrType === 0xFFFFFFFF) break;            // 属性列表结束
    const attrLen = rec.readUInt32LE(off + 4);
    if (attrLen <= 0 || off + attrLen > recordSize) break;
    const nonResident = rec.readUInt8(off + 8);
    if (attrType === 0x80 && nonResident === 1) {
      const runlistOff = off + rec.readUInt16LE(off + 0x20); // 游程表相对属性头的偏移
      let p = runlistOff;
      let lcn = 0;
      while (p < recordSize) {
        const header = rec.readUInt8(p);
        if (header === 0) break;
        const lenBytes = (header >> 4) & 0x0F;
        const offBytes = header & 0x0F;
        p += 1;
        let runLen = 0;
        for (let i = 0; i < lenBytes; i++) runLen |= rec.readUInt8(p + i) << (8 * i);
        p += lenBytes;
        let lcnDelta = 0;
        for (let i = 0; i < offBytes; i++) lcnDelta |= rec.readUInt8(p + i) << (8 * i);
        p += offBytes;
        // 符号扩展（负偏移表示稀疏游程，lcn 不变）
        const bits = 8 * offBytes;
        if (bits && (lcnDelta & (1 << (bits - 1)))) lcnDelta -= (1 << bits);
        lcn += lcnDelta;
        if (lcn > 0 && runLen > 0) runs.push({ lcn, clusters: runLen });
      }
      return runs; // 取第一个非驻留 $DATA 的游程（MFT 自身只有一个）
    }
    off += attrLen;
  }
  return runs;
}

// ---------- 3. 读取第 0 号记录，拿到 $MFT 的 data runs ----------
function readRecord(lcn) {
  const buf = Buffer.alloc(recordSize);
  fs.readSync(volFd, buf, 0, recordSize, lcn * bytesPerCluster);
  return buf;
}

const baseRec = readRecord(mftStartLcn);
applyFixup(baseRec, bytesPerSector);
const runs = parseDataRuns(baseRec);
if (!runs.length) {
  console.error('未能从 $MFT 第 0 号记录解析出 data runs（MFT 可能极小或结构异常）。');
  process.exit(1);
}

// ---------- 4. 逐片段读取并解析 FILE 记录 ----------
const nodes = [];           // { ref, parentRef, name, isDir, size }
let parsedRecords = 0;
let recordIndex = 0;
let scannedBytes = 0;

function processRecord(rec) {
  if (rec.toString('ascii', 0, 4) !== 'FILE') return false;  // 跳过 BAAD / 未分配(空)
  const flags = rec.readUInt16LE(0x16);
  if (!(flags & 0x01)) return false;                        // 0x01 = 在用
  applyFixup(rec, bytesPerSector);

  const attrOffset = rec.readUInt16LE(0x14);
  let off = attrOffset;
  let parentRef = 0, name = null, storedNs = 99, isDir = false, fnSize = 0, dataSize = null;

  while (off + 4 <= recordSize) {
    const attrType = rec.readUInt32LE(off);
    if (attrType === 0xFFFFFFFF) break;                     // 属性列表结束
    const attrLen = rec.readUInt32LE(off + 4);
    if (attrLen <= 0 || off + attrLen > recordSize) break;
    const nonResident = rec.readUInt8(off + 8);

    if (attrType === 0x30) {                                // $FILE_NAME
      const valOff = rec.readUInt16LE(off + 0x14);
      const valLen = rec.readUInt32LE(off + 0x10);
      const c = rec.slice(off + valOff, off + valOff + valLen);
      const pl = c.readUInt32LE(0);
      const ph = c.readUInt16LE(4);
      parentRef = pl + ph * 0x100000000;                    // 低 48 位 = 父目录记录号
      const fileAttrs = c.readUInt32LE(0x38);
      isDir = !!(fileAttrs & 0x10);
      fnSize = c.readUInt32LE(0x30) + c.readUInt32LE(0x34) * 0x100000000;
      const fnLen = c.readUInt8(0x40);
      const ns = c.readUInt8(0x41);
      const nm = c.slice(0x42, 0x42 + fnLen * 2).toString('utf16le');
      // 优先 Win32(1)/POSIX(0) 名，跳过 DOS(2) 8.3 别名，避免路径出现 8.3 名
      if (name === null || (ns <= 1 && storedNs > 1)) { name = nm; storedNs = ns; }
    } else if (attrType === 0x80 && dataSize === null) {     // $DATA
      if (!nonResident) {
        dataSize = rec.readUInt32LE(off + 0x10);             // 常驻：值长度即文件大小
      } else {
        dataSize = rec.readUInt32LE(off + 0x30) + rec.readUInt32LE(off + 0x34) * 0x100000000;
      }
    }
    off += attrLen;
  }

  const size = (dataSize != null) ? dataSize : fnSize;
  nodes.push({ ref: recordIndex, parentRef: parentRef & 0xFFFFFFFFFFFF, name, isDir, size });
  parsedRecords++;
  return true;
}

for (const run of runs) {
  const runBytes = run.clusters * bytesPerCluster;
  scannedBytes += runBytes;
  const buf = Buffer.alloc(runBytes);
  fs.readSync(volFd, buf, 0, runBytes, run.lcn * bytesPerCluster);
  let pos = 0;
  while (pos + recordSize <= buf.length) {
    processRecord(buf.slice(pos, pos + recordSize));
    recordIndex++;
    pos += recordSize;
  }
}
fs.closeSync(volFd);

const t1 = Date.now(); // MFT 读取+解析完成

// ---------- 5. 重建路径，过滤目标子树 ----------
const byRef = new Map();
for (const nd of nodes) byRef.set(nd.ref, nd);
const ROOT_REF = 5; // $Root 的 MFT 记录号
const pathCache = new Map();

function buildPath(ref, guard) {
  if (guard <= 0) return '??';
  const cached = pathCache.get(ref);
  if (cached !== undefined) return cached;
  const nd = byRef.get(ref);
  if (!nd) { pathCache.set(ref, ''); return ''; }
  if (ref === ROOT_REF || nd.parentRef === ROOT_REF) {
    pathCache.set(ref, nd.name || '');
    return nd.name || '';
  }
  if (nd.parentRef === ref) { pathCache.set(ref, nd.name || ''); return nd.name || ''; }
  const parentPath = buildPath(nd.parentRef, guard - 1);
  const full = parentPath ? parentPath + '\\' + nd.name : (nd.name || '');
  pathCache.set(ref, full);
  return full;
}

let fileCount = 0, dirCount = 0, totalSize = 0;
for (const nd of nodes) {
  const full = buildPath(nd.ref, 4096).toUpperCase();
  if (full === TARGET_UP || full.startsWith(TARGET_UP + '\\')) {
    if (nd.isDir) dirCount++;
    else { fileCount++; totalSize += nd.size; }
  }
}

const t2 = Date.now();

// ---------- 输出 ----------
console.log('========================================');
console.log(' NTFS $MFT 枚举基准');
console.log('========================================');
console.log('卷              :', VOLUME + ':');
console.log('目标目录        :', TARGET);
console.log('记录大小        :', recordSize, '字节');
console.log('MFT 数据片段    :', runs.length, '段, 共', (scannedBytes / 1048576).toFixed(1), 'MB');
console.log('扫描记录数      :', recordIndex, '(其中在用 FILE 记录', parsedRecords + ')');
console.log('----------------------------------------');
console.log('文件数          :', fileCount);
console.log('目录数          :', dirCount);
console.log('总大小(字节)    :', totalSize);
console.log('总大小(可读)    :', (totalSize / 1048576).toFixed(1), 'MB');
console.log('----------------------------------------');
console.log('MFT 读+解析耗时 :', (t1 - t0), 'ms');
console.log('路径重建+过滤   :', (t2 - t1), 'ms');
console.log('总耗时          :', (t2 - t0), 'ms');
console.log('========================================');
console.log('对照参考（readdir-fast）：2563 文件 / 195 目录 / 374,799,697 字节');
