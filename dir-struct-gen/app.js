/* 目录结构清单生成器 — 本地 Web App
 * 功能：浏览本机磁盘树（此电脑 → 驱动器 → 目录，逐层懒加载）→ 勾选要包含的目录
 *       → 生成 RemoteStorage 清单 JSON（可下载 / 复制 / 上传）。
 * 数据源：本地 Node 服务提供的 /api/drives 与 /api/list（服务器端读取真实文件系统，
 *        无需浏览器文件选择器，Firefox / Safari 也可用）。
 * 目录采用懒加载：点开某层才向服务器请求下一层。
 */

const $ = (id) => document.getElementById(id);

const state = {
  root: null,       // 此电脑 虚拟根节点（始终存在）
  computerId: null, // 本机 ID（主机名），用于清单根与 RS 文件名默认值
};

const dom = {
  optFiles: $('opt-files'),
  status: $('status'),
  tree: $('tree'),
  count: $('count'),
  preview: $('preview'),
  btnRegen: $('btn-regen'),
  btnCopy: $('btn-copy'),
  btnDownload: $('btn-download'),
  btnSelectAll: $('btn-select-all'),
  btnDeselectAll: $('btn-deselect-all'),
  btnExpand: $('btn-expand'),
  btnCollapse: $('btn-collapse'),
  rsHref: $('rs-href'),
  rsToken: $('rs-token'),
  rsBase: $('rs-base'),
  rsFile: $('rs-file'),
  btnUpload: $('btn-upload'),
  rsStatus: $('rs-status'),
  btnLoadLocal: $('btn-load-local'),
  inputLoadFile: $('input-load-file'),
  btnLoadRemote: $('btn-load-remote'),
};

/* ---------------- 树节点工具 ---------------- */

// 默认 unchecked：浏览整块磁盘时，避免一上来就把整个 C: 选进去。
function makeNode(name, kind, fsPath, parent = null) {
  return {
    name, kind, path: fsPath, parent,
    checked: false, indeterminate: false, children: [],
    _loaded: false, _collapsed: false, _loading: false,
    tags: [],        // 自动标签（来自后端 /api/list 探测）
    manualTags: [],  // 用户手动打的标签
  };
}

function sortChildren(node) {
  node.children.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });
}

function joinPath(base, name) {
  return /[\\/]$/.test(base) ? base + name : base + '\\' + name;
}

/* ---------------- 初始加载：列出本机磁盘 ---------------- */

async function loadInitial() {
  state.root = makeNode('此电脑', 'dir', null);
  state.root.checked = true;       // 根始终包含（禁用勾选）
  state.root._loaded = true;
  state.root.isComputer = true;
  try {
    const res = await fetch('/api/drives');
    const data = await res.json();
    const computerId = data.computerId || '此电脑';
    state.computerId = computerId;  // 缓存，供 RS 文件名默认值使用
    state.root.name = computerId;   // manifest 根 = 本机 ID，便于多台电脑区分
    const drives = (data.drives || []).map((d) => {
      const name = d.replace(/[\\/]+$/, ''); // "C:\" -> "C:"
      return makeNode(name, 'dir', d, state.root);
    });
    drives.sort((a, b) => a.name.localeCompare(b.name));
    state.root.children = drives;
    setStatus('已列出本机磁盘（' + computerId + '），点开盘符逐层浏览；勾选要包含的目录。');
  } catch (err) {
    setStatus('无法获取磁盘列表：' + err.message, true);
  }
  renderTree();
  regenerate();
}

/* ---------------- 懒加载：点开一层，向服务器请求下一层 ---------------- */

async function loadChildren(node, silent = false) {
  if (node.kind !== 'dir' || node._loaded || !node.path) return;
  node._loading = true;
  renderTree(); // 显示「加载中…」
  try {
    const res = await fetch('/api/list?path=' + encodeURIComponent(node.path));
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || ('HTTP ' + res.status));
    }
    const data = await res.json();
    const items = data.items || [];
    const kids = items.map((it) => {
      const k = makeNode(it.name, it.kind, joinPath(node.path, it.name), node);
      if (it.kind === 'dir') k.tags = it.tags || []; // 承接后端自动标签
      return k;
    });
    node.children = kids;
    // 级联一致：新展开的子项继承父节点的勾选态
    const inherited = node.checked;
    kids.forEach((k) => { k.checked = inherited; k.indeterminate = false; });
    node._loaded = true;
    setStatus('已加载：' + node.path + '（' + kids.length + ' 项）');
  } catch (err) {
    // 权限不足 / 结点不可读（如 Windows 的 Documents and Settings、$Recycle.Bin 等）：
    // 不报红、不再重试，标记为不可展开的 🔒 节点，但仍可勾选（勾选则作为空文件夹进清单）。
    node._loaded = true;
    node._error = true;
    node.children = [];
    setStatus('无法读取 ' + node.path + '（' + (err.message || err.code || '错误') + '），已标记为无访问权限。', false);
  } finally {
    node._loading = false;
    renderTree();
    // 程序化批量展开（如加载 JSON）时静默，只在全部完成后统一刷新一次预览，
    // 避免每展开一层都重盖 generatedAt 时间戳。
    if (!silent) regenerate();
  }
}

async function onTwisty(node) {
  if (!node._loaded) {
    await loadChildren(node);
    return;
  }
  node._collapsed = !node._collapsed;
  renderTree();
}

/* ---------------- 勾选级联 ---------------- */

function setChecked(node, val, indeterminate = false) {
  node.checked = val;
  node.indeterminate = indeterminate;
  if (node._cb) {
    node._cb.checked = val;
    node._cb.indeterminate = indeterminate;
  }
}

function propagateDown(node, val) {
  setChecked(node, val, false);
  node.children.forEach((c) => propagateDown(c, val));
}

function recomputeUp(node) {
  let cur = node.parent;
  while (cur) {
    if (cur === state.root) { cur = cur.parent; continue; } // 根始终包含，不反算
    const anyChecked = cur.children.some((c) => c.checked);
    const anyIndet = cur.children.some((c) => c.indeterminate);
    const allChecked = cur.children.every((c) => c.checked && !c.indeterminate);
    if (allChecked) setChecked(cur, true, false);
    else if (anyChecked || anyIndet) setChecked(cur, false, true);
    else setChecked(cur, false, false);
    cur = cur.parent;
  }
}

function onCheckChange(node) {
  if (node === state.root) return; // 根始终包含
  const val = node._cb.checked;
  propagateDown(node, val);
  recomputeUp(node);
  regenerate();
}

/* ---------------- 渲染树 ---------------- */

function renderTree() {
  dom.tree.innerHTML = '';
  if (!state.root) return;
  dom.tree.appendChild(renderNode(state.root, true));
  if (state.root.children.length === 0) {
    const hint = document.createElement('div');
    hint.className = 'tree-empty';
    hint.textContent = '（未检测到本地磁盘，请确认 serve.js 正在运行）';
    dom.tree.appendChild(hint);
  }
  updateCount();
}

function renderNode(node, isRoot = false) {
  if (node.kind === 'file' && !dom.optFiles.checked) return document.createComment('file-hidden');
  const wrap = document.createElement('div');
  wrap.className = 'tree-node';

  const row = document.createElement('div');
  row.className = 'tree-row';

  const twisty = document.createElement('span');
  twisty.className = 'twisty';
  if (node.kind === 'dir') {
    if (node._error) twisty.textContent = '';                             // 读取失败 → 不可展开
    else if (!node._loaded) twisty.textContent = '▸';                      // 未加载 → 点开展开
    else if (node.children.length) twisty.textContent = node._collapsed ? '▸' : '▾';
    else twisty.textContent = '';                                         // 空目录 → 无箭头
  }

  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = node.checked;
  cb.indeterminate = node.indeterminate;
  if (isRoot) cb.disabled = true; // 根始终包含
  node._cb = cb;

  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = node.name + (isRoot ? '  (根)' : '');

  const tag = document.createElement('span');
  tag.className = 'tag';
  if (node.kind === 'dir') {
    if (node.isComputer) tag.textContent = '💻';
    else if (node._error) { tag.textContent = '🔒'; tag.title = '无访问权限或读取失败'; }
    else tag.textContent = node._loaded ? '📁 ' + node.children.length : '📁';
  } else {
    tag.textContent = '📄';
  }

  row.append(twisty, cb, name, tag);

  // 标签区：自动标签（后端探测）+ 手动标签（用户添加，可移除）+ 添加按钮
  if (node.kind === 'dir') {
    const tagsEl = document.createElement('span');
    tagsEl.className = 'tags';
    const merged = [...new Set([...(node.tags || []), ...(node.manualTags || [])])];
    for (const t of merged) {
      const isManual = (node.manualTags || []).includes(t);
      const b = document.createElement('span');
      b.className = 'tag-badge ' + (isManual ? 'manual' : 'auto');
      b.textContent = t;
      if (isManual) {
        const x = document.createElement('span');
        x.className = 'tag-x';
        x.textContent = '×';
        x.title = '移除标签';
        x.addEventListener('click', (ev) => {
          ev.stopPropagation();
          node.manualTags = node.manualTags.filter((m) => m !== t);
          renderTree();
          regenerate();
        });
        b.appendChild(x);
      }
      tagsEl.appendChild(b);
    }
    // 手动添加标签
    const addBtn = document.createElement('button');
    addBtn.className = 'tag-add';
    addBtn.type = 'button';
    addBtn.textContent = '+标签';
    addBtn.title = '给目录手动打标签';
    addBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const v = window.prompt('给目录「' + node.name + '」添加标签：');
      if (!v) return;
      const tv = v.trim();
      if (!tv) return;
      node.manualTags = node.manualTags || [];
      if (!node.manualTags.includes(tv)) node.manualTags.push(tv);
      renderTree();
      regenerate();
    });
    tagsEl.appendChild(addBtn);
    row.appendChild(tagsEl);
  }

  wrap.appendChild(row);

  if (node._loading) {
    const loading = document.createElement('div');
    loading.className = 'tree-loading';
    loading.textContent = '加载中…';
    wrap.appendChild(loading);
  } else if (node.kind === 'dir' && node._loaded && !node._collapsed && node.children.length) {
    const childBox = document.createElement('div');
    childBox.className = 'tree-children';
    node.children.forEach((c) => childBox.appendChild(renderNode(c)));
    wrap.appendChild(childBox);
    node._childrenEl = childBox;
  }

  if (node.kind === 'dir' && twisty.textContent !== '') {
    twisty.addEventListener('click', () => onTwisty(node));
  }
  cb.addEventListener('change', () => onCheckChange(node));
  return wrap;
}

/* ---------------- 生成清单 ---------------- */

function buildManifest(node, includeFiles) {
  const children = [];
  for (const c of node.children) {
    if (c.kind === 'dir') {
      // 勾选(checked)或半选(indeterminate，即部分子项被选中)都需纳入并继续下钻，
      // 否则上层「半选」的目录会把已勾选的子目录甩出清单。
      if (c.checked || c.indeterminate) children.push(buildManifest(c, includeFiles));
    } else if (includeFiles && c.checked) {
      children.push({ name: c.name, type: 'file' });
    }
  }
  // 标签（自动 + 手动，去重）合并进清单，便于读取侧按标签筛选/展示。
  const merged = [...new Set([...(node.tags || []), ...(node.manualTags || [])])];
  const out = { name: node.name, type: 'folder', children };
  if (merged.length) out.tags = merged;
  return out;
}

function generateManifest(genAt) {
  const includeFiles = dom.optFiles.checked;
  const rootManifest = buildManifest(state.root, includeFiles);
  return {
    version: 1,
    generatedAt: genAt || new Date().toISOString(),
    generator: 'fluentos-dir-struct-gen',
    source: state.root.name,
    root: rootManifest,
  };
}

function regenerate(genAt) {
  if (!state.root) return;
  const manifest = generateManifest(genAt);
  dom.preview.value = JSON.stringify(manifest, null, 2);
  updateCount();
}

function countIncludedDirs(node) {
  let n = 0;
  for (const c of node.children) {
    if (c.kind === 'dir') {
      if (c.checked) n += 1 + countIncludedDirs(c);
    }
  }
  return n;
}
function countDirs(node) {
  let n = 0;
  const walk = (x) => x.children.forEach((c) => { if (c.kind === 'dir') { n++; walk(c); } });
  walk(node);
  return n;
}
function updateCount() {
  if (!state.root) { dom.count.textContent = ''; return; }
  dom.count.textContent = '包含目录 ' + countIncludedDirs(state.root) + ' / 已加载 ' + countDirs(state.root);
}

/* ---------------- 导出 ---------------- */

function downloadJSON() {
  if (!state.root) return;
  const blob = new Blob([dom.preview.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fs-manifest.json';
  a.click();
  URL.revokeObjectURL(url);
}

async function copyJSON() {
  if (!state.root) return;
  try {
    await navigator.clipboard.writeText(dom.preview.value);
    setStatus('已复制到剪贴板。');
  } catch {
    setStatus('复制失败，请手动选择文本复制。', true);
  }
}

/* ---------------- 上传到 RemoteStorage ---------------- */

function joinUrl(href, path) {
  const h = href.endsWith('/') ? href : href + '/';
  const p = (path || '').replace(/^\/+/, '');
  return h + p;
}

async function uploadToRS() {
  if (!state.root) { setRS('请先生成清单。', false); return; }
  const href = dom.rsHref.value.trim();
  const token = dom.rsToken.value.trim();
  const base = dom.rsBase.value.trim() || '/';
  const file = dom.rsFile.value.trim() || 'fs-manifest.json';
  if (!href || !token) { setRS('请填写服务器地址与 Token。', false); return; }

  const url = joinUrl(joinUrl(href, base), file);
  setRS('上传中…', null);
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: dom.preview.value,
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    setRS('上传成功：' + url, true);
  } catch (err) {
    setRS('上传失败：' + err.message, false);
  }
}

function setRS(msg, ok) {
  dom.rsStatus.textContent = msg;
  dom.rsStatus.className = 'rs-status ' + (ok === null ? '' : ok ? 'ok' : 'err');
}

/* ---------------- 辅助 ---------------- */

function setStatus(msg, isErr = false) {
  dom.status.textContent = msg;
  dom.status.style.color = isErr ? 'var(--danger)' : 'var(--text-soft)';
}

function forEachNode(node, fn) {
  fn(node);
  node.children.forEach((c) => forEachNode(c, fn));
}

/* ---------------- 持久化 UI 参数（自动填入） ---------------- */
// 把 RemoteStorage 等输入参数存到本地服务（/api/settings，文件名即主机名），刷新后自动回填。
function collectSettings() {
  return {
    rsHref: dom.rsHref.value.trim(),
    rsToken: dom.rsToken.value.trim(),
    rsBase: dom.rsBase.value.trim(),
    rsFile: dom.rsFile.value.trim(),
    optFiles: dom.optFiles.checked,
  };
}
async function saveSettings() {
  try {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collectSettings()),
    });
  } catch (_) { /* 保存失败不阻塞操作 */ }
}
async function loadSettings() {
  let s = {};
  try {
    const res = await fetch('/api/settings');
    s = await res.json();
  } catch (_) { /* 没有已存参数则使用默认值 */ }

  // 回填已保存的 RemoteStorage 参数；无保存值时给默认值。
  dom.rsHref.value = (s && s.rsHref != null) ? s.rsHref : '';
  dom.rsToken.value = (s && s.rsToken != null) ? s.rsToken : '';
  // 基础路径默认 /app_data/folders/，清单文件名默认用本机主机名。
  dom.rsBase.value = (s && s.rsBase != null) ? s.rsBase : '/app_data/folders/';
  let fileDefault = state.computerId;
  if (!fileDefault) {
    try { const d = await (await fetch('/api/drives')).json(); fileDefault = d.computerId; } catch (_) {}
  }
  dom.rsFile.value = (s && s.rsFile != null) ? s.rsFile : (fileDefault || 'fs-manifest');
  dom.optFiles.checked = (s && typeof s.optFiles === 'boolean') ? s.optFiles : false;
}

/* ---------------- 加载外部 JSON 并展开目录树 ---------------- */
// 清空当前勾选（保留根），便于从加载的清单重新选。
function clearSelection() {
  forEachNode(state.root, (n) => {
    if (n !== state.root) { setChecked(n, false, false); n._selected = false; }
  });
}

// 自底向上重算勾选/半选态。_selected 表示该节点在清单中被显式选中：
// 若其下子项全部勾选且无半选 → 完全勾选；否则 → 半选（仍会被 buildManifest 纳入）。
function recompute(node) {
  if (node.kind !== 'dir' || !node._loaded) return;
  for (const c of node.children) recompute(c);
  if (node === state.root) return;
  if (node.children.length === 0) {
    setChecked(node, !!node._selected, false);
    return;
  }
  let allChecked = true, anyChecked = false, anyIndet = false;
  for (const c of node.children) {
    if (c.checked) anyChecked = true; else allChecked = false;
    if (c.indeterminate) anyIndet = true;
  }
  if (node._selected) {
    setChecked(node, allChecked && !anyIndet, !(allChecked && !anyIndet));
  } else {
    if (allChecked) setChecked(node, true, false);
    else if (anyChecked || anyIndet) setChecked(node, false, true);
    else setChecked(node, false, false);
  }
}

// 把一个 manifest 应用到当前磁盘树：展开对应目录并勾选。
async function applyManifest(manifest) {
  if (!manifest || !manifest.root) { setStatus('JSON 格式不正确：缺少 root。', true); return; }
  if (!state.root || state.root.children.length === 0) {
    setStatus('本机磁盘尚未列好，请稍候再加载。', true);
    return;
  }
  clearSelection();
  setStatus('正在按清单展开目录…');

  async function applyNode(mNode, liveNode) {
    // 加载该层（加载前先取消勾选，避免子项被继承勾选）；静默展开，最后统一刷新预览。
    if (liveNode.kind === 'dir' && !liveNode._loaded && liveNode.path) {
      const prev = liveNode.checked;
      liveNode.checked = false;
      await loadChildren(liveNode, true);
      liveNode.checked = prev;
    }
    liveNode._selected = true;
    for (const mChild of (mNode.children || [])) {
      const isFolder = mChild.type === 'folder' || mChild.type === undefined;
      if (isFolder) {
        const child = liveNode.children.find((c) => c.kind === 'dir' && c.name === mChild.name);
        if (child) await applyNode(mChild, child);
      } else if (mChild.type === 'file' && dom.optFiles.checked) {
        const f = liveNode.children.find((c) => c.kind === 'file' && c.name === mChild.name);
        if (f) setChecked(f, true, false);
      }
    }
  }

  // 顶层按驱动器名匹配（忽略清单 root 的主机名，按盘符对齐）
  for (const mDrive of (manifest.root.children || [])) {
    if (mDrive.type !== 'folder' && mDrive.type !== undefined) continue;
    const liveDrive = state.root.children.find((c) => c.kind === 'dir' && c.name === mDrive.name);
    if (liveDrive) await applyNode(mDrive, liveDrive);
  }

  recompute(state.root);
  renderTree();
  // 保留原 JSON 的 generatedAt（若没有则使用当前时间），而不是用「加载时刻」覆盖。
  regenerate(manifest.generatedAt);
  setStatus('已根据清单展开并勾选目录（未匹配到的盘符/路径已跳过）。');
}

function loadLocalJSON(file) {
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const manifest = JSON.parse(String(reader.result));
      await applyManifest(manifest);
    } catch (err) {
      setStatus('解析本地 JSON 失败：' + err.message, true);
    }
  };
  reader.readAsText(file);
}

async function loadRemoteJSON() {
  const href = dom.rsHref.value.trim();
  const token = dom.rsToken.value.trim();
  const base = dom.rsBase.value.trim() || '/';
  const file = dom.rsFile.value.trim() || 'fs-manifest.json';
  if (!href || !token) { setStatus('请先填写 RemoteStorage 服务器地址与 Token。', true); return; }
  const url = joinUrl(joinUrl(href, base), file);
  setStatus('正在从 RemoteStorage 加载 ' + url + ' …');
  try {
    const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const manifest = await res.json();
    await applyManifest(manifest);
  } catch (err) {
    setStatus('从 RemoteStorage 加载失败：' + err.message, true);
  }
}

/* ---------------- 事件绑定 ---------------- */

dom.optFiles.addEventListener('change', () => { renderTree(); regenerate(); });
dom.btnRegen.addEventListener('click', regenerate);
dom.btnCopy.addEventListener('click', copyJSON);
dom.btnDownload.addEventListener('click', downloadJSON);
dom.btnUpload.addEventListener('click', uploadToRS);

dom.btnSelectAll.addEventListener('click', () => {
  if (!state.root) return;
  forEachNode(state.root, (n) => setChecked(n, true, false));
  regenerate();
});
dom.btnDeselectAll.addEventListener('click', () => {
  if (!state.root) return;
  forEachNode(state.root, (n) => { if (n !== state.root) setChecked(n, false, false); });
  regenerate();
});
dom.btnExpand.addEventListener('click', () => {
  if (!state.root) return;
  forEachNode(state.root, (n) => { if (n.kind === 'dir' && n._loaded) n._collapsed = false; });
  renderTree();
});
dom.btnCollapse.addEventListener('click', () => {
  if (!state.root) return;
  forEachNode(state.root, (n) => { if (n.kind === 'dir' && n._loaded && n !== state.root) n._collapsed = true; });
  renderTree();
});

// 加载外部 JSON：本地文件 / RemoteStorage
dom.btnLoadLocal.addEventListener('click', () => dom.inputLoadFile.click());
dom.inputLoadFile.addEventListener('change', () => {
  const f = dom.inputLoadFile.files && dom.inputLoadFile.files[0];
  if (f) loadLocalJSON(f);
  dom.inputLoadFile.value = ''; // 允许重复选同一文件
});
dom.btnLoadRemote.addEventListener('click', loadRemoteJSON);

// RemoteStorage 参数 / 选项变更时自动持久化（刷新后自动填入）
[dom.rsHref, dom.rsToken, dom.rsBase, dom.rsFile, dom.optFiles].forEach((el) => {
  el.addEventListener('change', saveSettings);
});

// 启动时列出本机磁盘，并回填已保存的 UI 参数
loadInitial();
loadSettings();
