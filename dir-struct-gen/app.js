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
    _leaf: false,   // 底部节点标记：仅当磁盘上确实无子目录（加载后 children 为空）时置 true，渲染时无展开按钮
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
      const root = typeof d === 'string' ? d : d.root;
      const rawName = typeof d === 'string' ? d : (d.letter || d.root);
      const name = (rawName || '').replace(/[\\/]+$/, '') || rawName || '';
      const node = makeNode(name, 'dir', root, state.root);
      // 盘的稳定身份（来自磁盘根的 .dir-struct-id）；取不到则为 null（回退按主机+盘符）。
      node.volumeId = typeof d === 'string' ? null : (d.volumeId || null);
      return node;
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
      if (it.kind === 'dir') {
        k.tags = it.tags || []; // 承接后端自动标签
        // 后端已确认该目录无任何子目录 → 叶子（未加载也不显示展开按钮）
        if (it.hasSubdir === false) k._leaf = true;
      }
      return k;
    });
    node.children = kids;
    // 缺省不选中：新展开的子目录不继承父节点勾选态，
    // 避免「展开已勾选目录时自动选中其子目录」（子目录需单独勾选）。
    node._loaded = true;
    // 底部节点：磁盘上「无任何子目录」（即使有文件）即为叶子 → 渲染时无展开按钮。
    node._leaf = !node.children.some((c) => c.kind === 'dir');
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
  // 折叠的目录：其子目录当前不可见，只勾当前目录本身，不联动子目录。
  if (node._collapsed) return;
  // 展开的目录：联动「当前可见」的所有直接子项（直接子目录/文件）；
  // 仅当直接子目录自身也未折叠（其子目录可见）时，才继续下钻联动更深的后代。
  for (const c of node.children) {
    setChecked(c, val, false);
    if (c.kind === 'dir' && !c._collapsed) propagateDown(c, val);
  }
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
  node._selected = val; // 记录用户勾选态：勾选→清单选中（保持 ✓），取消→false
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
    else if (node._leaf) twisty.textContent = '';                         // 底部节点 → 无展开按钮
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
    // 深挖标记：该目录被读取侧深挖，已多读一层纳入清单
    if (node._deepened) {
      const d = document.createElement('span');
      d.className = 'tag-badge deepened';
      d.textContent = '深挖';
      d.title = '该目录被读取侧深挖，已多读一层纳入清单';
      tagsEl.appendChild(d);
    }
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
  } else if (node.kind === 'dir' && node._loaded && !node._collapsed && !node._leaf && node.children.length) {
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
  // 驱动层节点带稳定 volumeId（来自磁盘根 .dir-struct-id），供读取侧去重 / 命名深挖标记；
  // 子目录不重复携带，靠祖先驱动节点溯源即可。
  if (node.volumeId) out.volumeId = node.volumeId;
  // 底部节点标记：仅当磁盘上确实无子目录（加载后 children 为空）时写入。
  // 读取侧据此把该目录直接当底部节点，省去一次磁盘 /api/list 请求。
  if (node._leaf) out.leaf = true;
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

/* ---------------- 按卷拆分上传 + 深挖标记应用 ---------------- */

function joinUrl(href, path) {
  const h = href.endsWith('/') ? href : href + '/';
  const p = (path || '').replace(/^\/+/, '');
  return h + p;
}

// RemoteStorage 路径里只允许安全字符，其余替换为下划线（如 HostA::C: → HostA__C_）。
function sanitizeKey(s) {
  return (s || '').replace(/[^A-Za-z0-9._-]/g, '_');
}

// 一块盘的共享键：有 volumeId 用 volumeId（跨主机去重），否则回退 主机::盘符。
function volumeKeyFor(drive) {
  return drive.volumeId || (state.computerId + '::' + drive.name);
}

// 读取某块盘的深挖标记（app_data/folder-deepen/<key>.json）。
async function loadDeepenMarks(key) {
  const href = dom.rsHref.value.trim();
  const token = dom.rsToken.value.trim();
  if (!href || !token) return [];
  // folder-deepen 是独立 category，固定位于 <user>/app_data/folder-deepen/，
  // 不能拼 rsBase（清单所在 /app_data/folders/），否则会 404。
  const url = joinUrl(href, 'app_data/folder-deepen/' + sanitizeKey(key) + '.json');
  try {
    const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
    if (!res.ok) return [];
    const obj = await res.json().catch(() => null);
    const marks = obj && Array.isArray(obj.marks) ? obj.marks : [];
    return marks.filter((m) => typeof m === 'string');
  } catch (_) { return []; }
}

// 消耗某块盘的深挖标记（清空为 {marks:[]}，写回同一文件）。
async function clearDeepenMarks(key) {
  const href = dom.rsHref.value.trim();
  const token = dom.rsToken.value.trim();
  if (!href || !token) return;
  const url = joinUrl(href, 'app_data/folder-deepen/' + sanitizeKey(key) + '.json');
  try {
    await fetch(url, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ marks: [] }),
    });
  } catch (_) { /* 清理失败不阻断 */ }
}

// 把 host-relative 标记路径（"E:/Photos/2024"）还原成段数组，去掉盘符。
function markPathSegs(driveName, p) {
  const cleaned = String(p)
    .replace(/^[A-Za-z]:[\\/]?/, '')
    .replace(/^\/+/, '');
  return cleaned.split(/[\\/]+/).filter(Boolean);
}

// 沿路径逐层加载，最终对目标目录多读一层磁盘，使其出现在清单里。
async function ensureDeepened(drive, segs) {
  let cur = drive;
  for (const seg of segs) {
    if (!cur._loaded) await loadChildren(cur, true);
    const child = cur.children.find((c) => c.kind === 'dir' && c.name === seg);
    if (!child) return false; // 路径在磁盘上不存在
    cur = child;
  }
  if (!cur._loaded) await loadChildren(cur, true); // 多读一层
  cur._deepened = true; // 标记为深挖目录，树中特殊显示
  return true;
}

// 应用全部深挖标记：读取 → 逐块盘深挖 → 消耗标记。返回统计。
async function applyDeepenMarks(clear = true) {
  let total = 0;
  const warns = [];
  for (const drive of state.root.children) {
    if (drive.kind !== 'dir') continue;
    const key = volumeKeyFor(drive);
    const marks = await loadDeepenMarks(key);
    if (!marks.length) continue;
    // 迭代最多 5 轮：处理「标记目录的子目录也被标记」的嵌套情形。
    let pending = marks.map((p) => markPathSegs(drive.name, p));
    for (let round = 0; round < 5 && pending.length; round++) {
      const remain = [];
      for (const segs of pending) {
        const ok = await ensureDeepened(drive, segs);
        if (!ok) remain.push(segs);
      }
      if (remain.length === pending.length) {
        // 无进展（路径不存在等），停止避免死循环。
        for (const s of remain) warns.push(drive.name + '/' + s.join('/'));
        break;
      }
      pending = remain;
    }
    total += marks.length;
    // 上传时消费标记（清空）；从 RS 加载时保留标记，供后续继续消费。
    if (clear) await clearDeepenMarks(key);
  }
  return { total, warns };
}

// 按 name 并集合并两棵卷子树（不同主机对同一块盘的选择累加）。
function mergeVolumeTrees(existing, incoming) {
  const exChildren = Array.isArray(existing.children) ? existing.children : [];
  const inChildren = Array.isArray(incoming.children) ? incoming.children : [];
  const map = new Map();
  for (const c of exChildren) map.set(c.name, c);
  for (const c of inChildren) {
    if (map.has(c.name)) map.set(c.name, mergeVolumeTrees(map.get(c.name), c));
    else map.set(c.name, c);
  }
  return { ...existing, children: [...map.values()] };
}

async function uploadToRS() {
  if (!state.root) { setRS('请先生成清单。', false); return; }
  const href = dom.rsHref.value.trim();
  const token = dom.rsToken.value.trim();
  const base = dom.rsBase.value.trim() || '/';
  const file = dom.rsFile.value.trim() || state.computerId || 'fs-manifest';
  if (!href || !token) { setRS('请填写服务器地址与 Token。', false); return; }

  setRS('正在应用深挖标记…', null);
  try {
    // 1) 应用深挖标记（按需多读磁盘层），并刷新预览。
    const { total, warns } = await applyDeepenMarks();
    renderTree();   // 刷新，让深挖目录的特殊标识显示出来
    regenerate();

    const manifest = generateManifest();

    // 2) 主机索引：只记录「本机挂了哪些盘、挂在哪个盘符、稳定身份是什么」。
    const mounts = manifest.root.children.map((d) => {
      const vkey = volumeKeyFor(d);
      return { letter: d.name, volumeId: d.volumeId || null, file: sanitizeKey(vkey) };
    });
    const hostIndex = {
      version: 2,
      source: manifest.source,
      generatedAt: manifest.generatedAt,
      generator: manifest.generator,
      mounts,
    };

    // 3) 逐块盘：拆分出独立卷文件，与远端已有卷文件并集合并（多主机选择累加）后上传。
    const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
    let uploaded = 0;
    for (const d of manifest.root.children) {
      // 注意：这里 d 是 buildManifest 产出的 manifest 节点，字段是 type:'folder'，
      // 不是内存树节点的 kind:'dir'，之前误判 d.kind 导致所有驱动被跳过、卷文件不上传。
      if (d.type !== 'folder') continue;
      const vkey = volumeKeyFor(d);
      const fname = sanitizeKey(vkey);
      const incoming = {
        volumeId: d.volumeId || null,
        name: d.name,
        type: 'folder',
        children: d.children,
        sources: [manifest.source],
      };
      // 拉取已有卷文件（可能由其他主机上传过同一块盘）。
      let existing = null;
      try {
        const g = await fetch(joinUrl(joinUrl(href, base), fname + '.json'), {
          headers: { 'Authorization': 'Bearer ' + token },
        });
        if (g.ok) existing = await g.json().catch(() => null);
      } catch (_) { /* 远端无该卷文件 → 直接上传 */ }
      const merged = existing && Array.isArray(existing.children)
        ? mergeVolumeTrees(existing, incoming)
        : incoming;
      const srcSet = new Set([
        ...(existing && Array.isArray(existing.sources) ? existing.sources : []),
        ...incoming.sources,
      ]);
      merged.sources = [...srcSet];

      const vurl = joinUrl(joinUrl(href, base), fname + '.json');
      const vres = await fetch(vurl, { method: 'PUT', headers, body: JSON.stringify(merged, null, 2) });
      if (!vres.ok) throw new Error('HTTP ' + vres.status + ' (' + fname + ')');
      uploaded++;
    }

    // 4) 上传主机索引。
    // 主机索引文件名：rsFile 可能已带 .json（如 LAPTOP-91PR81Q2.json），
    // 这里保证只补一次后缀，避免生成 LAPTOP-91PR81Q2.json.json。
    const hostName = (file.endsWith('.json') ? file : file + '.json');
    const hurl = joinUrl(joinUrl(href, base), sanitizeKey(hostName));
    const hres = await fetch(hurl, { method: 'PUT', headers, body: JSON.stringify(hostIndex, null, 2) });
    if (!hres.ok) throw new Error('HTTP ' + hres.status + ' (host index)');

    let msg = '上传成功：' + uploaded + ' 个卷 + 主机索引';
    if (total) msg += '（已应用 ' + total + ' 个深挖标记）';
    if (warns.length) msg += '；未匹配路径：' + warns.join(', ');
    setRS(msg, true);
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
    // 明确勾选（用户勾选或清单勾选）的目录保持全选（✓），
    // 不因子目录部分未勾选而降为半选（横线）。
    setChecked(node, true, false);
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
    const children = mNode.children || [];
    // 清单标记 leaf：混合策略——先回退校验磁盘一次。
    // 磁盘确实无子目录才按底部节点处理（无展开按钮、勾选整目录、不下钻）；
    // 若磁盘已有子目录（清单过时），落到下方常规逻辑，保留展开按钮、缺省不展开。
    if (mNode.leaf === true) {
      if (liveNode.kind === 'dir' && !liveNode._loaded && liveNode.path) {
        await loadChildren(liveNode, true);
      }
      // 磁盘上无任何子目录（即使有文件）→ 底部节点
      if (!liveNode.children.some((c) => c.kind === 'dir')) {
        setChecked(liveNode, true, false);
        liveNode._selected = true;
        liveNode._leaf = true;
        return;
      }
    }
    // 下一层需要还原的子目录
    const subDirs = children.filter((c) => c.type === 'folder' || c.type === undefined);
    // 是否还包含需要勾选的文件（仅当“包含文件”开启时清单才会有 file 子项）
    const needFiles = dom.optFiles.checked && children.some((c) => c.type === 'file');

    // 下一层既没有目录、也没有可勾选文件 → 整目录选中即可。
    // 主动校验磁盘一次，确定是否为底部节点：
    // 磁盘确实无子目录 → _leaf（无展开按钮、整目录勾选、不下钻）；
    // 磁盘仍有子目录（清单过时）→ 保留展开按钮、缺省折叠，点开时再懒加载。
    if (subDirs.length === 0 && !needFiles) {
      if (liveNode.kind === 'dir' && !liveNode._loaded && liveNode.path) {
        await loadChildren(liveNode, true);
        liveNode._collapsed = true;
      }
      setChecked(liveNode, true, false);
      liveNode._selected = true;
      // 磁盘上无任何子目录（即使有文件）→ 底部节点，无展开按钮
      if (!liveNode.children.some((c) => c.kind === 'dir')) liveNode._leaf = true;
      return;
    }

    // 有需要还原的子目录（或文件）才加载本层。
    // 加载前先取消勾选，避免子项被继承勾选；静默展开，最后统一刷新预览。
    liveNode._selected = true;
    if (liveNode.kind === 'dir' && !liveNode._loaded && liveNode.path) {
      const prev = liveNode.checked;
      liveNode.checked = false;
      await loadChildren(liveNode, true);
      liveNode.checked = prev;
    }
    for (const mChild of children) {
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
    // 加载后：按 folder_deepen 里列的目录下钻展示（保留标记，不清空），
    // 使这些深挖目录也在树中出现并带上「深挖」徽章。
    const deepen = await applyDeepenMarks(false);
    renderTree();
    regenerate(manifest.generatedAt);
    console.log('[dir-struct] folder_deepen 结果:', deepen);
    let extra = deepen.total
      ? '；已按 folder_deepen 下钻 ' + deepen.total + ' 个目录（标记保留）'
      : '；folder_deepen 未读到任何可下钻目录';
    if (deepen.warns.length) extra += '；未匹配路径：' + deepen.warns.slice(0, 6).join('、');
    setStatus('已根据清单展开并勾选目录（未匹配到的盘符/路径已跳过）。' + extra, false);
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

// 页面顶部显示程序版本号（来自后端 /api/version，便于识别当前运行的代码版本）
fetch('/api/version')
  .then((r) => r.json())
  .then((d) => { const el = document.getElementById('version'); if (el && d.version) el.textContent = 'v' + d.version; })
  .catch(() => {});
