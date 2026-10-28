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
  return (root || '').replace(/[\\/]+$/, '');
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
    // 3) 读不到也写不了（只读盘 / 无权限，如系统根 /、CD-ROM）→ 回退按主机+盘符
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

function listDir(p) {
  const dirents = fs.readdirSync(p, { withFileTypes: true });
  const items = [];
  for (const e of dirents) {
    // 过滤掉磁盘身份标记文件，避免它污染目录树 / 清单。
    if (e.name === VOLUME_MARKER) continue;
    let isDir = false;
    let isSymlinkDir = false;
    if (e.isDirectory()) {
      isDir = true;
    } else if (e.isSymbolicLink()) {
      try {
        isSymlinkDir = fs.statSync(path.join(p, e.name)).isDirectory();
      } catch (_) {
        isSymlinkDir = false;
      }
    }
    if (isDir || isSymlinkDir) {
      // 自动打标签：仅对真实目录读取其「直接子项名」做一次轻量探测，
      // 失败（无权限 / 不可读）则不打标签，不影响目录本身列出。
      let tags = [];
      if (isDir) {
        try {
          tags = detectTags(fs.readdirSync(path.join(p, e.name)));
        } catch (_) { /* 跳过标签探测 */ }
      }
      items.push({ name: e.name, kind: 'dir', tags });
    } else {
      items.push({ name: e.name, kind: 'file' });
    }
  }
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
    try {
      const items = listDir(p);
      sendJSON(res, 200, { path: p, items });
    } catch (err) {
      sendJSON(res, 404, { error: err.code || 'error', message: err.message });
    }
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

server.listen(PORT, () => {
  console.log('Dir Struct Generator running:');
  console.log('  http://localhost:' + PORT + '/');
  console.log('  http://127.0.0.1:' + PORT + '/');
  console.log('Press Ctrl+C to stop.');
});
