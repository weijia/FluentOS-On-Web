// Zero-dependency local server for the Dir Struct Generator web app.
// Run:  node serve.js   (then open the printed URL in a normal browser tab)
//
// Serves the static web app AND exposes two local-only APIs so the page can
// browse the real filesystem without any browser file-picker dialog:
//   GET /api/drives            -> { computerId, drives: ["C:\\", "D:\\", ...] }
//   GET /api/list?path=<dir>   -> { path, items: [{ name, kind, tags }] }
//                                  tags 由后端按目录内容自动探测（如含 .git ⇒ "git"）
//   GET /api/settings          -> 本机持久化的 UI 参数（RemoteStorage 等），文件名即主机名
//   PUT /api/settings          -> 写入上述参数（body 为 JSON）
//
// This only listens on localhost and is meant for the user's own machine.
// It can read any path the OS account can read.

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
const PORT = 8000;

// 程序版本号：用于页面上方展示，方便识别当前运行的是哪一版代码。
const APP_VERSION = '1.6.0';

// 持久化的 UI 参数（RemoteStorage 等）存放目录。
// 默认放在本应用目录下 app_data/folders/，文件名即主机名；如需改用真实 /app_data 绝对路径，改这里即可。
const APP_DATA_DIR = path.join(ROOT, 'app_data', 'folders');

function getComputerId() {
  try { return os.hostname(); } catch (_) { return 'pc-' + Date.now(); }
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

/* ---------------- auto-tagging ---------------- */
// 自动打标签规则：若某目录自身「直接」包含下面这些条目名，则给它打上对应标签。
// 例如目录里有 .git ⇒ 打 "git"；有 package.json ⇒ 打 "node"。
const TAG_RULES = [
  { match: '.git', tag: 'git' },
  { match: '.gitignore', tag: 'git' },
  { match: '.gitmodules', tag: 'git' },
  { match: 'node_modules', tag: 'node_modules' },
  { match: 'package.json', tag: 'node' },
  { match: 'package-lock.json', tag: 'npm' },
  { match: 'yarn.lock', tag: 'yarn' },
  { match: 'pnpm-lock.yaml', tag: 'pnpm' },
  { match: 'pnpm-workspace.yaml', tag: 'pnpm' },
  { match: 'Cargo.toml', tag: 'rust' },
  { match: 'Cargo.lock', tag: 'rust' },
  { match: 'requirements.txt', tag: 'python' },
  { match: 'pyproject.toml', tag: 'python' },
  { match: 'setup.py', tag: 'python' },
  { match: '.venv', tag: 'venv' },
  { match: 'venv', tag: 'venv' },
  { match: '.svn', tag: 'svn' },
  { match: '.hg', tag: 'hg' },
  { match: '.idea', tag: 'idea' },
  { match: '.vscode', tag: 'vscode' },
  { match: 'Dockerfile', tag: 'docker' },
  { match: 'docker-compose.yml', tag: 'docker' },
  { match: 'docker-compose.yaml', tag: 'docker' },
  { match: 'go.mod', tag: 'go' },
  { match: 'go.sum', tag: 'go' },
  { match: 'Gemfile', tag: 'ruby' },
  { match: 'Gemfile.lock', tag: 'ruby' },
  { match: 'pom.xml', tag: 'maven' },
  { match: 'build.gradle', tag: 'gradle' },
  { match: 'build.gradle.kts', tag: 'gradle' },
  { match: 'Makefile', tag: 'make' },
  { match: 'CMakeLists.txt', tag: 'cmake' },
];

function detectTags(names) {
  const set = new Set(names);
  const tags = [];
  for (const rule of TAG_RULES) {
    if (set.has(rule.match)) tags.push(rule.tag);
  }
  return tags;
}

/* ---------------- local filesystem helpers ---------------- */

// 磁盘稳定身份标记文件：首次见到某块盘时在其根目录写入一个 UUID，
// 之后所有系统读到的都是同一串字节 → 跨 OS / 跨协议（含云盘）一致，
// 从根本上避免「同一块盘在不同主机上被当成不同盘」导致的重复数据。
const VOLUME_MARKER = '.dir-struct-id';

function normalizeRoot(root) {
  if (!root) return root;
  // Windows 盘符根（C: / C:\ / c:）必须保留尾部反斜杠：
  // 在 Windows 里 `C:` 表示该盘的「当前工作目录」，`C:\` 才是根目录。
  // 若去掉尾斜杠，fs.readdirSync("C:") 会读到盘符当前目录而非根目录。
  if (/^[A-Za-z]:[\\/]?$/i.test(root)) return root.charAt(0).toUpperCase() + ':\\';
  // POSIX 根 `/` 也不能去掉尾部斜杠。
  if (root === '/') return '/';
  // 其余路径：去掉末尾的斜杠/反斜杠，避免后续 path.join 拼接时重复。
  return root.replace(/[\\/]+$/, '');
}

// 备选稳定键：当盘根无法写入身份标记文件时（如系统盘 C:\ 根目录对普通用户只读、
// CD-ROM、某些网络盘），回退使用「卷序列号」作为稳定身份。卷序列号在格式化时分配，
// 不依赖写盘权限，对真实本地盘稳定可用；取不到时（如云盘不暴露序列号）返回 null，
// 由上游回退到「主机::盘符」。
function getVolumeSerial(root) {
  if (process.platform !== 'win32') return null;
  const m = /^([A-Za-z]):/.exec(root || '');
  if (!m) return null;
  const letter = m[1];
  const tryParse = (out) => {
    let mm = out.match(/([0-9A-F]{4}-[0-9A-F]{4})/i); // vol: 1C2D-3E4F
    if (mm) return mm[1].toUpperCase();
    mm = out.match(/0x([0-9A-F]{8})/i);              // fsutil: 0x12345678
    if (mm) {
      const hex = mm[1].toUpperCase();
      return hex.slice(0, 4) + '-' + hex.slice(4);
    }
    return null;
  };
  // 优先 vol（最通用，无需特殊权限）；失败再试 fsutil volumeinfo。
  try {
    const out = execFileSync('cmd', ['/c', 'vol', letter + ':'], { windowsHide: true, timeout: 3000 }).toString();
    const serial = tryParse(out);
    if (serial) return serial;
  } catch (_) { /* vol 不可用，尝试 fsutil */ }
  try {
    const out = execFileSync('cmd', ['/c', 'fsutil', 'fsinfo', 'volumeinfo', letter + ':\\'], { windowsHide: true, timeout: 3000 }).toString();
    return tryParse(out);
  } catch (_) { /* 都取不到 */ }
  return null;
}

function ensureVolumeId(root) {
  const r = normalizeRoot(root);
  if (!r) return null;
  const marker = path.join(r, VOLUME_MARKER);
  // 1) 已存在标记文件 → 直接读回（跨系统同一串字节）
  try {
    const existing = fs.readFileSync(marker, 'utf8').trim();
    if (/^[0-9a-fA-F-]{8,}$/.test(existing)) return existing;
  } catch (_) { /* 还没有标记文件 */ }
  // 2) 没有 → 生成一个 UUID 写回（首次见到这块盘）
  try {
    const id = crypto.randomUUID();
    fs.writeFileSync(marker, id);
    try {
      // Windows：加隐藏属性，避免污染资源管理器视图
      if (process.platform === 'win32') {
        execFileSync('attrib', ['+h', marker], { windowsHide: true, timeout: 3000 });
      }
    } catch (_) { /* 隐藏属性可选，忽略 */ }
    return id;
  } catch (_) {
    // 3) 读不到也写不了（只读盘 / 无权限，如系统根 C:\、CD-ROM）→
    //    先回退用卷序列号做稳定键（不依赖写盘权限，真实本地盘稳定可用）；
    //    连序列号都取不到（网络盘/云盘等）→ 再回退 null，上游按「主机::盘符」命名。
    const serial = getVolumeSerial(r);
    if (serial) return serial;
    return null;
  }
}

// 把盘根路径规整成「驱动对象」，附带稳定的 volumeId。
function driveObj(root) {
  const r = normalizeRoot(root);
  const letter = r || root;
  return { letter, root: r, volumeId: ensureVolumeId(r) };
}

function listDrives() {
  const platform = process.platform;
  if (platform === 'win32') {
    try {
      const out = execFileSync(
        'powershell',
        ['-NoProfile', '-NonInteractive', '-Command',
         '(Get-PSDrive -PSProvider FileSystem).Root'],
        { timeout: 8000, windowsHide: true }
      ).toString();
      const drives = out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      if (drives.length) return drives.map(driveObj);
    } catch (_) { /* fall through to probing */ }
    // Fallback: probe A–Z drive letters.
    const found = [];
    for (let i = 67; i <= 90; i++) {
      const letter = String.fromCharCode(i);
      try {
        fs.readdirSync(letter + ':\\');
        found.push(letter + ':\\');
      } catch (_) { /* not a ready drive */ }
    }
    return found.map(driveObj);
  }
  if (platform === 'darwin') {
    try {
      const vols = fs.readdirSync('/Volumes').filter((v) => v !== '.DS_Store');
      return ['/'].concat(vols.map((v) => '/Volumes/' + v)).map(driveObj);
    } catch (_) {
      return ['/'].map(driveObj);
    }
  }
  // linux / other
  try {
    const mnt = fs.readdirSync('/mnt');
    return ['/'].concat(mnt.map((m) => '/mnt/' + m)).map(driveObj);
  } catch (_) {
    return ['/'].map(driveObj);
  }
}

// 给一个 Promise 加超时；超时抛错。用于兜住极慢/不可达目录（如网络挂载盘、
// 或 Node readdirSync 在某盘上会阻塞几十秒的目录），避免单线程 serve 被拖死。
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
  ]);
}

// 探测某子目录：判断「是否有子目录」（叶子判定）+ 自动打标签。
// 全部用 fs.promises（libuv 线程池），不阻塞事件循环；并对单个探测加超时：
// 极慢/不可读目录缺省按「有子目录」处理（保留展开按钮），不让它拖死整个响应。
async function probeDir(p, name) {
  const fallback = { tags: [], hasSubdir: true };
  let sub;
  try {
    sub = await withTimeout(fs.promises.readdir(path.join(p, name), { withFileTypes: true }), 1500);
  } catch (_) { return fallback; }
  const tags = detectTags(sub.map((s) => s.name));
  let hasSubdir = false;
  for (const s of sub) {
    if (s.isDirectory()) { hasSubdir = true; break; }
    if (s.isSymbolicLink()) {
      try { if ((await fs.promises.stat(path.join(p, name, s.name))).isDirectory()) { hasSubdir = true; break; } }
      catch (_) {}
    }
  }
  return { tags, hasSubdir };
}

async function listDir(p) {
  let dirents;
  try {
    dirents = await withTimeout(fs.promises.readdir(p, { withFileTypes: true }), 4000);
  } catch (err) {
    throw Object.assign(new Error('readdir failed'), { code: err.code || 'E_TIMEOUT_OR_IO' });
  }
  const items = [];
  const jobs = [];
  for (const e of dirents) {
    // 过滤掉磁盘身份标记文件，避免它污染目录树 / 清单。
    if (e.name === VOLUME_MARKER) continue;
    let isDir = false;
    let isSymlinkDir = false;
    if (e.isDirectory()) {
      isDir = true;
    } else if (e.isSymbolicLink()) {
      try {
        isSymlinkDir = (await fs.promises.stat(path.join(p, e.name))).isDirectory();
      } catch (_) { isSymlinkDir = false; }
    }
    if (isDir || isSymlinkDir) {
      // 并行探测所有子目录，避免逐个串行放慢响应。
      jobs.push(
        probeDir(p, e.name).then((probe) => items.push({ name: e.name, kind: 'dir', ...probe }))
      );
    } else {
      items.push({ name: e.name, kind: 'file' });
    }
  }
  await Promise.all(jobs);
  items.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });
  return items;
}

/* ---------------- request router ---------------- */

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  // ---- API routes (local only) ----
  if (urlPath === '/api/drives') {
    try {
      // computerId 用于区分多台电脑生成的清单；默认用主机名，失败则回退时间戳。
      sendJSON(res, 200, { computerId: getComputerId(), drives: listDrives() });
    } catch (err) {
      sendJSON(res, 500, { error: err.message });
    }
    return;
  }
  if (urlPath === '/api/version') {
    sendJSON(res, 200, { version: APP_VERSION });
    return;
  }
  if (urlPath === '/api/settings') {
    const file = path.join(APP_DATA_DIR, getComputerId() + '.json');
    if (req.method === 'PUT' || req.method === 'POST') {
      let body = '';
      req.on('data', (c) => { body += c; if (body.length > 1e6) req.destroy(); });
      req.on('end', () => {
        try {
          const obj = JSON.parse(body || '{}');
          fs.mkdirSync(APP_DATA_DIR, { recursive: true });
          fs.writeFileSync(file, JSON.stringify(obj, null, 2));
          sendJSON(res, 200, { ok: true });
        } catch (err) {
          sendJSON(res, 500, { error: err.message });
        }
      });
      return;
    }
    // GET
    try {
      if (fs.existsSync(file)) {
        sendJSON(res, 200, JSON.parse(fs.readFileSync(file, 'utf8')));
      } else {
        sendJSON(res, 200, {});
      }
    } catch (err) {
      sendJSON(res, 500, { error: err.message });
    }
    return;
  }
  if (urlPath === '/api/list') {
    const u = new URL(req.url, 'http://localhost');
    const p = u.searchParams.get('path');
    if (!p) { sendJSON(res, 400, { error: 'missing path' }); return; }
    (async () => {
      try {
        const items = await listDir(p);
        sendJSON(res, 200, { path: p, items });
      } catch (err) {
        sendJSON(res, 404, { error: err.code || 'error', message: err.message });
      }
    })();
    return;
  }

  // ---- static files ----
  let staticPath = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = path.join(ROOT, staticPath);
  const resolved = path.normalize(filePath);
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }
  fs.readFile(resolved, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + staticPath);
      return;
    }
    const ext = path.extname(resolved).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port ' + PORT + ' is already in use. Stop the other server or change PORT in serve.js.');
  } else {
    console.error(err);
  }
  process.exit(1);
});

// 仅当作为主模块直接运行（node serve.js）时才启动 HTTP 服务；
// 被 require 时（如单元测试）不监听端口，方便复用内部函数。
if (require.main === module) {
  server.listen(PORT, () => {
    console.log('Dir Struct Generator running:');
    console.log('  http://localhost:' + PORT + '/');
    console.log('  http://127.0.0.1:' + PORT + '/');
    console.log('Press Ctrl+C to stop.');
  });
}

module.exports = { ensureVolumeId, getVolumeSerial, listDrives, driveObj, normalizeRoot };
