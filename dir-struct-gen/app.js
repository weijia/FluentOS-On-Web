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
  previewFiles: [], // 当前预览的 v2 拆分文件列表 [{name, content, isHost}]，与上传到 RS 的内容一致
};

const dom = {
  optFiles: $('opt-files'),
  optSize: $('opt-size'),
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

// 人类可读的文件大小：字节 → B/KB/MB/GB（1024 进制，保留两位小数）。
function formatSize(bytes) {
  if (typeof bytes !== 'number' || bytes < 0) return '—';
  if (bytes < 1024) return bytes + ' B';
  const units = ['KB', 'MB', 'GB', 'TB', 'PB'];
  let v = bytes / 1024, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return v.toFixed(v >= 100 || v % 1 === 0 ? 0 : 1) + ' ' + units[i];
}

// 千分位文件数：1234 → "1,234"。
function formatCount(n) {
  if (typeof n !== 'number' || n < 0) return '—';
  return n.toLocaleString('en-US');
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

// 把后端 /api/list 返回的 items 应用到节点（生成子节点），提取为共用函数，供缓存命中与网络请求两条路径复用。
function applyListItems(node, items) {
  const kids = items.map((it) => {
    const k = makeNode(it.name, it.kind, joinPath(node.path, it.name), node);
    if (it.kind === 'file') {
      // 承接后端 /api/list 返回的文件大小（字节），供「包含文件」时写入清单。
      if (typeof it.size === 'number') k.size = it.size;
    } else {
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
}

async function loadChildren(node, silent = false) {
  if (node.kind !== 'dir' || node._loaded || !node.path) return;
  // 仅当「包含文件 + 汇总文件大小」同时开启时，请求时带 sizes=1，
  // 让后端对每个文件 stat 取字节数（用于清单里单个文件的 size 字段），避免拖慢日常浏览。
  const needSizes = dom.optFiles.checked && dom.optSize.checked;
  const cacheKey = node.path + (needSizes ? '#s' : '');
  // 先查前端目录缓存：命中且在有效期内则直接复用，不向服务器请求（折叠重开、加载 JSON 后重建树、
  // 切换「含子目录」后重展开等场景均受益于该缓存，同一个目录绝不重复取）。
  const cached = dirCache.get(cacheKey);
  if (cached && (Date.now() - cached.at) < DIR_CACHE_TTL) {
    applyListItems(node, cached.items);
    setStatus('已加载（缓存）：' + node.path + '（' + cached.items.length + ' 项）');
    if (!silent) regenerate();
    return;
  }
  node._loading = true;
  renderTree(); // 显示「加载中…」
  try {
    const qs = '/api/list?path=' + encodeURIComponent(node.path) + (needSizes ? '&sizes=1' : '');
    const res = await fetch(qs);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || ('HTTP ' + res.status));
    }
    const data = await res.json();
    const items = data.items || [];
    // 写入前端目录缓存，供后续复用。
    dirCache.set(cacheKey, { items, at: Date.now() });
    applyListItems(node, items);
    setStatus('已加载：' + node.path + '（' + items.length + ' 项）');
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
  // 取消勾选时，若曾开启「含子目录」，清除递归抓取缓存与标记，避免未选中子树残留/误计入。
  if (!val && node._includeSubtree) {
    node._includeSubtree = false;
    node._subtreeGathered = false;
    node.children = [];
    node._loaded = false;
    node._leaf = false;
  }
  recomputeUp(node);
  regenerate();
}

/* ---------------- 含子目录（递归选择） ---------------- */

// 切换某目录的「含子目录」递归选择：
// 开 → 勾选该目录并递归向后端抓取其下全部子孙目录（含尚未在 UI 加载的层）纳入清单；
// 关 → 清除递归抓取缓存，回到「仅勾选本目录」语义。
async function onIncludeSubtree(node) {
  if (node === state.root) return; // 根始终包含，不涉及
  node._includeSubtree = !node._includeSubtree;
  if (node._includeSubtree) {
    setChecked(node, true, false);
    node._selected = true;
    if (!node._subtreeGathered) {
      setStatus('正在递归抓取 ' + (node.path || node.name) + ' 下的所有子目录…');
      await gatherSubtree(node);
      renderTree();
    }
    recomputeUp(node);
  } else {
    node._subtreeGathered = false;
    node.children = [];
    node._loaded = false;
    node._leaf = false;
    recomputeUp(node);
  }
  renderTree();
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

  // 目录大小徽标：仅当该目录「已加入索引」（被勾选 checked 或半选 indeterminate，
  // 即会出现在生成的清单里）时才展示其（含子孙）的文件数与总大小。未选中的目录不取大小、不显示，
  // 避免把已取消勾选的目录误显示成「有大小」。
  const sizeInfo = document.createElement('span');
  sizeInfo.className = 'size-info';
  let hasSize = false;
  if (node.kind === 'dir' && (node.checked || node.indeterminate) && node._summary) {
    sizeInfo.textContent = formatCount(node._summary.fileCount) + ' 项 · ' + formatSize(node._summary.totalSize);
    sizeInfo.title = '文件数 ' + node._summary.fileCount + ' · 总大小 ' + node._summary.totalSize + ' 字节';
    hasSize = true;
  }

  const tag = document.createElement('span');
  tag.className = 'tag';
  if (node.kind === 'dir') {
    if (node.isComputer) tag.textContent = '💻';
    else if (node._error) { tag.textContent = '🔒'; tag.title = '无访问权限或读取失败'; }
    else tag.textContent = node._loaded ? '📁 ' + node.children.length : '📁';
  } else {
    tag.textContent = '📄';
  }

  if (hasSize) row.append(twisty, cb, name, sizeInfo, tag);
  else row.append(twisty, cb, name, tag);

  // 「含子目录」递归选择开关（仅目录、非根）：一次性勾选该目录及其下全部子孙目录。
  if (node.kind === 'dir' && !isRoot) {
    const subBtn = document.createElement('button');
    subBtn.type = 'button';
    subBtn.className = 'subtree-btn' + (node._includeSubtree ? ' active' : '');
    subBtn.textContent = node._includeSubtree ? '⊖ 含子目录' : '⊕ 含子目录';
    subBtn.title = node._includeSubtree
      ? '已递归包含该目录下的所有子目录（含未加载的层）；点击取消'
      : '递归包含该目录下的所有子目录（含尚未在 UI 加载的层）';
    subBtn.addEventListener('click', (ev) => { ev.stopPropagation(); onIncludeSubtree(node); });
    row.appendChild(subBtn);
  }

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
    // 含子目录（递归选择）徽章
    if (node._includeSubtree) {
      const s = document.createElement('span');
      s.className = 'tag-badge subtree';
      s.textContent = '含子目录';
      s.title = '该目录已递归包含其下全部子目录（含尚未在 UI 加载的层）';
      tagsEl.appendChild(s);
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

// 递归抓取某目录下所有后代目录（含尚未在 UI 中加载的层），返回清单 children 数组，
// 并就地填充 node.children（全部 checked、_loaded、_collapsed），便于用户在树中展开核验。
// 用于「含子目录」递归选择：勾选某目录即把其下全部子目录（含未加载的孙目录）纳入清单。
// 改版：只向后端发一次 /api/tree（递归返回整棵子目录树），单次取回，不再对每个目录逐个请求。
async function gatherSubtree(node, visited) {
  visited = visited || new Set();
  if (!node.path || visited.has(node.path)) return;
  visited.add(node.path);
  let data;
  try {
    const res = await fetch('/api/tree?path=' + encodeURIComponent(node.path));
    if (!res.ok) return;
    data = await res.json();
  } catch (_) { return; }
  const tree = data && data.tree;
  if (!tree) return;
  // 把这次一次性拉回的整棵子树逐层写入前端目录缓存：即便之后切换「含子目录」、节点对象被重置，
  // 再展开这些层级也直接命中缓存，不再回退到逐层 /api/list 请求。
  cacheTreeLevel(node.path, tree.children || []);
  // 把后端返回的嵌套 folder 树转成前端内存树节点（默认全勾选），供 buildManifestAsync 继续下钻。
  node.children = treeToLiveChildren(node, tree.children || []);
  node._loaded = true;
  node._collapsed = true;
  node._leaf = !node.children.some((c) => c.kind === 'dir');
  node._subtreeGathered = true;
}

// 把后端 /api/tree 返回的整棵子树逐层写入前端目录缓存（dirCache），键为该目录的绝对路径。
// 归一化为 /api/list 的 item 形状（{name, kind, tags, hasSubdir}），使缓存命中路径与 lazy 加载完全一致。
function cacheTreeLevel(dirPath, treeChildren) {
  const items = [];
  for (const t of treeChildren) {
    if (t.kind === 'dir') {
      const childPath = joinPath(dirPath, t.name);
      items.push({ name: t.name, kind: 'dir', tags: t.tags || [], hasSubdir: t.hasSubdir });
      if (t.children && t.children.length) cacheTreeLevel(childPath, t.children);
    } else if (t.kind === 'file') {
      items.push({ name: t.name, kind: 'file' });
    }
  }
  dirCache.set(dirPath, { items, at: Date.now() });
}

// 把后端 /api/tree 的嵌套 folder 树转成前端内存树节点：子目录默认勾选、已加载、收起，
// 并继续递归转换其 children；无子目录则标记为底部节点（_leaf）。
function treeToLiveChildren(parent, treeChildren) {
  const live = [];
  for (const t of treeChildren) {
    const child = makeNode(t.name, t.kind, joinPath(parent.path, t.name), parent);
    if (t.kind === 'dir') {
      child.tags = t.tags || [];
      child.checked = true;
      child._selected = true;
      child._loaded = true;
      child._collapsed = true;
      child.children = treeToLiveChildren(child, t.children || []);
      // 无子目录（即使有文件）即为底部节点：渲染时无展开按钮。
      child._leaf = !child.children.some((c) => c.kind === 'dir');
      child._subtreeGathered = true;
    }
    live.push(child);
  }
  return live;
}

// 把内存树节点转成清单 folder 对象。异步：遇到标记「含子目录」(_includeSubtree) 且尚未抓取的节点，
// 先递归向后端抓取完整子树（含未加载的层），再继续下钻。
async function buildManifestAsync(node, includeFiles, ctx) {
  const children = [];
  for (const c of node.children) {
    if (c.kind === 'dir') {
      // 勾选(checked)或半选(indeterminate，即部分子项被选中)都需纳入并继续下钻，
      // 否则上层「半选」的目录会把已勾选的子目录甩出清单。
      if (c.checked || c.indeterminate) {
        // 「含子目录」：递归抓取该目录下的完整子树（含尚未在 UI 加载的层）；
        // 已抓取过(_subtreeGathered)则直接复用缓存，避免每次刷新重复请求。
        if (c._includeSubtree && !c._subtreeGathered) await gatherSubtree(c);
        children.push(await buildManifestAsync(c, includeFiles, ctx));
      }
    } else if (includeFiles && c.checked) {
      const f = { name: c.name, type: 'file' };
      // 「汇总文件大小」开启且已知字节数时，把单个文件大小写入清单。
      if (ctx.includeSizes && typeof c.size === 'number' && c.size > 0) f.size = c.size;
      children.push(f);
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
  // 目录汇总：该目录下所有文件（含子孙）的数量与总大小（字节）。
  // 数据来自后端 /api/summary 的「一次性批量预取」：前端把被选中的目录作为根，后端对每个根
  // 递归统计整棵子树，单次请求即返回 path -> {fileCount,totalSize} 的完整映射（含所有子孙目录）。
  // 因此这里只做查表，前端绝不再逐目录发请求；后端已保证每个目录（含符号链接指向的）都有记录。
  if (ctx.includeSizes && node.path) {
    const sum = getSummary(node.path); // 直查路径级缓存（含该目录整棵子树曾被一次性取回）
    if (sum) {
      out.fileCount = sum.fileCount;
      out.totalSize = sum.totalSize;
      node._summary = sum; // 缓存到树节点，供树形视图展示目录大小
    }
  }
  return out;
}

// 清空所有树节点上缓存的目录大小（_summary）。每次重新生成清单前调用：
// 仅「当前在索引里」的目录会在 buildManifestAsync 遍历时重新挂上 _summary，
// 被取消勾选（或祖先被取消）的目录因不再被遍历而不会重新获得 _summary，从而
// 保证树形视图里只有「已加入索引」的目录才显示大小，避免残留旧大小。
function clearSummaries(node) {
  if (!node) return;
  delete node._summary;
  for (const c of (node.children || [])) clearSummaries(c);
}

// 收集「需要扫描文件大小」的最小独立目录根：遍历整棵选择树，找出所有
// checked / indeterminate 的目录节点，但**排除那些祖先（不含自身、不含虚拟根「此电脑」）
// 已经 checked 的节点**——因为它们已被父目录整段覆盖，无需自成一根。
// 返回的节点彼此不存在父子包含关系，后端对每个根递归扫描各自子树，绝不扫描未选中部分/整盘。
function collectSummaryRoots(node, ancestorChecked) {
  const result = [];
  const isRealDir = node.kind === 'dir' && node.path;
  const checked = !!node.checked;
  // 仅「整目录被勾选(checked)」的节点作为独立扫描根：它会被完整扫描整棵子树。
  // 半选(indeterminate)不是扫描根——它只是部分后代被选中，真正的根落在更深的 checked 后代上，
  // 那些根已在递归中返回；若把半选祖先也当根（如只选 C:\a\b 却扫整个 C:\），会误扫整块大盘。
  if (isRealDir && checked && !ancestorChecked) result.push(node);
  // 向下覆盖规则：只有本节点「真实目录且整目录勾选(checked)」时，其子树才被完整覆盖、子节点无需再独立成根。
  // 半选(indeterminate)节点不向子节点传播「已覆盖」——子节点仍需各自判是否为根。
  // 虚拟根「此电脑」没有真实路径（isRealDir=false），checked 只是容器语义，不向下覆盖。
  const childAncestorChecked = ancestorChecked || (isRealDir && checked);
  for (const c of (node.children || [])) {
    if (c.kind === 'dir') result.push(...collectSummaryRoots(c, childAncestorChecked));
  }
  return result;
}

// 文件大小汇总缓存：按「单个目录路径」缓存 /api/summary 的结果。后端对每个根递归统计整棵子树，
// 单次请求即返回该根下所有目录（含子孙）的 fileCount/totalSize；前端把返回的每个目录都写进本缓存，
// 因此「取消勾选/重选」导致扫描根集合变化时，已扫描过的子树仍命中本缓存，绝不会重复扫描整块父目录。
// TTL 内复用，避免短时间内重复扫描磁盘。
const summaryCache = new Map(); // path -> { fileCount, totalSize, at }
const SUMMARY_TTL = 120000;     // 缓存有效期 2 分钟（之后自动重新扫描以反映磁盘变化）

// 从路径级缓存取某目录的汇总；过期或缺失返回 null。后端曾把该目录连同其整棵子树一起返回并写入缓存，
// 故直接查本缓存即可拿到「含子孙」的任意目录大小，无需重新请求后端。
function getSummary(path) {
  if (!path) return null;
  const c = summaryCache.get(path);
  if (!c) return null;
  if ((Date.now() - c.at) >= SUMMARY_TTL) return null;
  return c;
}

// 目录浏览缓存：按「绝对路径」缓存该目录已加载的子项列表，跨节点对象重建（加载 JSON 清单、
// 切换「含子目录」等会把 _loaded 重置的场景）依然有效，从根上避免对同一个目录重复请求 /api/list。
// 键区分是否含文件大小两种返回（needSizes），二者数据结构不同。TTL 内复用，过期后重新拉取以反映磁盘变化。
const dirCache = new Map(); // key(path + '#s'|'') -> { items, at }
const DIR_CACHE_TTL = 5 * 60 * 1000; // 5 分钟

// 一次性把「被选中的目录」里【尚未缓存/已过期】的根发给后端，单次请求取回它们各自子树
// （含所有子孙目录）的大小映射；其余根直接复用路径级缓存（含其整棵子树），绝不重复扫描磁盘。
// rootPaths：最小独立扫描根（已被 collectSummaryRoots 排除掉被祖先覆盖的目录，故彼此无包含关系）。
async function fetchAllSummaries(rootPaths) {
  if (!rootPaths || !rootPaths.length) return;
  const uniq = [...new Set(rootPaths)];
  const now = Date.now();
  // 只挑「路径级缓存缺失或过期」的根；由于之前取某根时已将其整棵子树一并写入缓存，
  // 因此命中缓存的根意味着它和它所有子孙都已在缓存，无需再请求——这是取消勾选后不重扫父目录的关键。
  const missing = uniq.filter(p => {
    const c = summaryCache.get(p);
    return !c || (now - c.at) >= SUMMARY_TTL;
  });
  if (missing.length === 0) return; // 全部命中缓存，后端零请求
  setStatus('正在汇总选中目录的文件大小…');
  // 把所有缺失根拼进同一个 /api/summary 请求（?path=A&path=B&…），后端对每个根递归统计整棵子树，
  // 一次返回所有目录（含子孙）的大小，避免前端逐目录请求。
  const q = missing.map(p => 'path=' + encodeURIComponent(p)).join('&');
  // 前端超时兜底：整轮汇总最多等 3 分钟，超时/失败则放弃大小汇总（不附 fileCount/totalSize），
  // 但绝不阻断清单生成——避免某块大盘扫描卡死导致整页预览永久不更新。
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 180000);
  try {
    const res = await fetch('/api/summary?' + q, { signal: ctrl.signal });
    if (!res.ok) return;
    const data = await res.json();
    const sums = (data && data.summaries) || {};
    // 把后端返回的每一个目录（含所有子孙）都写进路径级缓存，供本次及后续（扫描根变化后）直接复用。
    for (const [k, v] of Object.entries(sums)) summaryCache.set(k, { fileCount: v.fileCount, totalSize: v.totalSize, at: now });
  } catch (_) {
    // 失败/超时：本次放弃大小汇总，但不写脏缓存；下次 regenerate 仍会重试缺失根。
  } finally {
    clearTimeout(timer);
  }
}

// 生成清单前，对「实际纳入索引」的盘根惰性写入磁盘身份标记文件（稳定 volumeId，跨主机去重用）。
// 调用后端 POST /api/volume-id（异步、best-effort、带超时），失败也不影响生成（回退序列号/主机::盘符）。
// 注意：列举阶段（/api/drives）已为每个盘填好 volumeId（序列号回退），manifest 只认该值；正常流程下
// 所有盘早已有 volumeId，下面循环直接跳过、不会再发请求——避免每次勾选/展开都反复向服务器查 C: 盘序列号。
// 仅在「确实还没有 volumeId」的盘上才惰性写一次，且每个盘单会话只尝试一次（_vidTried 去重）。
const _vidTried = new Set();
async function ensureDriveVolumeIds() {
  if (!state.root || !state.root.children) return;
  const jobs = [];
  for (const d of state.root.children) {
    if (d.kind !== 'dir' || !d.path) continue;
    // 已有 volumeId（来自 /api/drives）或本会话已尝试过：跳过，绝不重复请求/写盘。
    if (d.volumeId || _vidTried.has(d.path)) continue;
    // 仅「被选中(checked)或半选(indeterminate)」的盘才需要稳定身份——其余盘不在清单里。
    if (!(d.checked || d.indeterminate)) continue;
    _vidTried.add(d.path);
    jobs.push((async () => {
      try {
        const res = await fetch('/api/volume-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: d.path }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.volumeId) d.volumeId = data.volumeId;
        }
      } catch (_) { /* best-effort，忽略 */ }
    })());
  }
  await Promise.all(jobs);
}

async function generateManifest(genAt) {
  const includeFiles = dom.optFiles.checked;
  const includeSizes = dom.optSize.checked;
  const ctx = { includeFiles, includeSizes };
  // 仅当开启了「汇总文件数与大小」时，才去后端拿文件数与总大小。
  // 关键优化：只把「被选中的目录」作为扫描根传给 /api/summary，后端只递归统计这些子树，
  // 绝不扫描整块盘；且前端只发一次请求（所有根一起带过去），后端递归返回每棵子树全部目录的大小，
  // 前端不再逐目录请求。通过 summaryCache 走内存缓存（按根集合，TTL 2 分钟）。
  // 先清空旧的大小缓存（节点上的 _summary）：仅「当前在索引里」的目录会在下方遍历时重新挂上
  // _summary，取消勾选（或祖先被取消）的目录不再被遍历，从而树里只显示已加入索引目录的大小。
  if (state.root) clearSummaries(state.root);
  // 先对用到的盘惰性写入稳定身份标记（异步，不阻塞；失败回退序列号）。
  await ensureDriveVolumeIds();
  if (includeSizes && state.root) {
    const roots = collectSummaryRoots(state.root); // 最小独立扫描根（排除被祖先选中的）
    // 把「尚未缓存/过期」的根批量发给后端；已缓存（含各自整棵子树）的根直接命中 summaryCache，
    // 取消勾选/重选导致根集合变化时也不会重复扫描父目录。
    await fetchAllSummaries(roots.map(r => r.path));
  }
  const rootManifest = await buildManifestAsync(state.root, includeFiles, ctx);
  return {
    version: 1,
    generatedAt: genAt || new Date().toISOString(),
    generator: 'fluentos-dir-struct-gen',
    source: state.root.name,
    root: rootManifest,
  };
}

// 预览生成做防抖：勾选级联 / 连续展开会在 250ms 内多次调用，合并为一次真实生成，
// 避免每次操作都触发整盘扫描导致预览长时间不更新。保留最后一次传入的 genAt（用于从
// JSON 加载时保持原 generatedAt 时间戳）。
let _regenTimer = null;
let _regenGenAt = undefined;
function regenerate(genAt) {
  if (genAt !== undefined) _regenGenAt = genAt;
  if (_regenTimer) clearTimeout(_regenTimer);
  _regenTimer = setTimeout(() => {
    _regenTimer = null;
    const at = _regenGenAt;
    _regenGenAt = undefined;
    doRegenerate(at);
  }, 250);
}

async function doRegenerate(genAt) {
  if (!state.root) return;
  const manifest = await generateManifest(genAt);
  // 刷新树形视图：把刚计算出的目录大小（node._summary）显示到目录行上。
  renderTree();
  // 预览与上传保持一致：拆成 v2 格式——主机索引(version:2) + 每块盘一个卷文件，
  // 与 uploadToRS 写入 RemoteStorage 的文件一一对应（文件名、结构完全一致）。
  const file = dom.rsFile.value.trim() || state.computerId || 'fs-manifest';
  const payload = buildV2Payload(manifest, file);
  if (!payload.volumes.length && !payload.hostIndex.json.mounts.length) {
    state.previewFiles = [];
  } else {
    state.previewFiles = [
      { name: payload.hostIndex.name, content: JSON.stringify(payload.hostIndex.json, null, 2), isHost: true },
      ...payload.volumes.map((v) => ({ name: v.name, content: JSON.stringify(v.json, null, 2), isHost: false })),
    ];
  }
  renderPreview();
  updateCount();
}

// 由完整 manifest(version:1) 构建 v2 拆分的「上传载荷」——预览与上传共用同一份，确保两者一致。
// 返回 { hostIndex: {name, json}, volumes: [{name, json}] }。
function buildV2Payload(manifest, file) {
  const drives = (manifest.root.children || []).filter((d) => d.type === 'folder');
  const mounts = drives.map((d) => {
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
  const volumes = drives.map((d) => {
    const vkey = volumeKeyFor(d);
    const fname = sanitizeKey(vkey);
    const json = {
      volumeId: d.volumeId || null,
      name: d.name,
      type: 'folder',
      children: d.children,
      sources: [manifest.source],
    };
    return { key: vkey, name: fname + '.json', json };
  });
  const hostName = (file.endsWith('.json') ? file : file + '.json');
  return { hostIndex: { name: sanitizeKey(hostName), json: hostIndex }, volumes };
}

// 渲染多卡片预览：每个上传文件一个只读窗口（主机索引 + 各卷文件），文件名与 RS 上一致。
function renderPreview() {
  const host = dom.preview;
  host.innerHTML = '';
  if (!state.previewFiles || !state.previewFiles.length) {
    const p = document.createElement('p');
    p.className = 'empty-hint';
    p.textContent = '请勾选要包含的目录，生成后在此预览上传到 RemoteStorage 的 v2 清单。';
    host.appendChild(p);
    return;
  }
  for (const f of state.previewFiles) {
    const card = document.createElement('div');
    card.className = 'preview-card' + (f.isHost ? ' host-card' : '');
    const head = document.createElement('div');
    head.className = 'preview-card-head';
    const title = document.createElement('span');
    title.className = 'preview-card-title';
    title.textContent = f.name + (f.isHost ? '（主机索引 · v2）' : '（卷文件 · v2）');
    const spacer = document.createElement('span');
    spacer.className = 'spacer';
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-sm';
    copyBtn.textContent = '复制';
    copyBtn.addEventListener('click', () => copyText(f.content, f.name));
    // 展开 / 收起：默认上限高度 + 滚动；点「展开」则放开高度看完整大文件。
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn btn-sm';
    toggleBtn.textContent = '展开';
    toggleBtn.addEventListener('click', () => {
      const exp = card.classList.toggle('expanded');
      toggleBtn.textContent = exp ? '收起' : '展开';
    });
    head.appendChild(title);
    head.appendChild(spacer);
    head.appendChild(toggleBtn);
    head.appendChild(copyBtn);
    const ta = document.createElement('textarea');
    ta.className = 'preview-card-body';
    ta.readOnly = true;
    ta.value = f.content;
    // 高度随内容自适应（上限避免过长；点「展开」可放开看完整内容）
    ta.style.height = Math.min(ta.scrollHeight + 12, 420) + 'px';
    card.appendChild(head);
    card.appendChild(ta);
    host.appendChild(card);
  }
}

// 复制单个预览文件的内容。
async function copyText(content, name) {
  try {
    await navigator.clipboard.writeText(content);
    setStatus('已复制 ' + name + ' 到剪贴板。');
  } catch {
    setStatus('复制失败，请手动选择文本复制。', true);
  }
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

// 把多个 v2 文件打包成 ZIP（store 存储，无压缩，零依赖）下载，
// 解压后即为上传到 RemoteStorage 的同一组文件，保证「下载 = 预览 = 上传」。
function downloadJSON() {
  if (!state.previewFiles || !state.previewFiles.length) return;
  const blob = buildZipBlob(state.previewFiles.map((f) => ({ name: f.name, content: f.content })));
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (dom.rsFile.value.trim() || state.computerId || 'fs-manifest') + '.zip';
  a.click();
  URL.revokeObjectURL(url);
}

async function copyJSON() {
  if (!state.previewFiles || !state.previewFiles.length) return;
  const combined = state.previewFiles
    .map((f) => '// ' + f.name + '\n' + f.content)
    .join('\n\n');
  try {
    await navigator.clipboard.writeText(combined);
    setStatus('已复制全部清单文件（' + state.previewFiles.length + ' 个）到剪贴板。');
  } catch {
    setStatus('复制失败，请手动选择文本复制。', true);
  }
}

// 极简 ZIP 写入（store 方法，纯 JS 零依赖）：输入 [{name, content}]，返回 Blob。
function buildZipBlob(files) {
  const enc = new TextEncoder();
  // 预计算 CRC32 表
  const crcTable = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();
  const crc32 = (bytes) => {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  };
  const parts = [];
  const central = [];
  let offset = 0;
  for (const f of files) {
    const nameBytes = enc.encode(f.name);
    const dataBytes = enc.encode(f.content);
    const crc = crc32(dataBytes);
    const size = dataBytes.length;
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true);
    lh.setUint16(4, 20, true);
    lh.setUint16(6, 0, true);
    lh.setUint16(8, 0, true);
    lh.setUint16(10, 0, true);
    lh.setUint16(12, 0, true);
    lh.setUint32(14, crc, true);
    lh.setUint32(18, size, true);
    lh.setUint32(22, size, true);
    lh.setUint16(26, nameBytes.length, true);
    lh.setUint16(28, 0, true);
    parts.push(new Uint8Array(lh.buffer), nameBytes, dataBytes);
    const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true);
    cd.setUint16(4, 20, true);
    cd.setUint16(6, 20, true);
    cd.setUint16(8, 0, true);
    cd.setUint16(10, 0, true);
    cd.setUint16(12, 0, true);
    cd.setUint16(14, 0, true);
    cd.setUint32(16, crc, true);
    cd.setUint32(20, size, true);
    cd.setUint32(24, size, true);
    cd.setUint16(28, nameBytes.length, true);
    cd.setUint16(30, 0, true);
    cd.setUint16(32, 0, true);
    cd.setUint16(34, 0, true);
    cd.setUint16(36, 0, true);
    cd.setUint32(38, 0, true);
    cd.setUint32(42, offset, true);
    central.push({ head: new Uint8Array(cd.buffer), name: nameBytes });
    offset += 30 + nameBytes.length + size;
  }
  let centralSize = 0;
  const centralParts = [];
  for (const c of central) {
    centralParts.push(c.head, c.name);
    centralSize += c.head.length + c.name.length;
  }
  const centralOffset = offset;
  const eo = new DataView(new ArrayBuffer(22));
  eo.setUint32(0, 0x06054b50, true);
  eo.setUint16(4, 0, true);
  eo.setUint16(6, 0, true);
  eo.setUint16(8, files.length, true);
  eo.setUint16(10, files.length, true);
  eo.setUint32(12, centralSize, true);
  eo.setUint32(16, centralOffset, true);
  eo.setUint16(20, 0, true);
  parts.push(...centralParts, new Uint8Array(eo.buffer));
  return new Blob(parts, { type: 'application/zip' });
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

    const manifest = await generateManifest();

    // 2) 复用与预览相同的 v2 拆分逻辑，保证「上传内容 == 预览内容」。
    const payload = buildV2Payload(manifest, file);

    // 3) 逐块盘：把卷文件与远端已有卷文件并集合并（多主机选择累加）后上传。
    const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
    let uploaded = 0;
    for (const vol of payload.volumes) {
      // 拉取已有卷文件（可能由其他主机上传过同一块盘）。
      let existing = null;
      try {
        const g = await fetch(joinUrl(joinUrl(href, base), vol.name), {
          headers: { 'Authorization': 'Bearer ' + token },
        });
        if (g.ok) existing = await g.json().catch(() => null);
      } catch (_) { /* 远端无该卷文件 → 直接上传 */ }
      const merged = existing && Array.isArray(existing.children)
        ? mergeVolumeTrees(existing, vol.json)
        : vol.json;
      const srcSet = new Set([
        ...(existing && Array.isArray(existing.sources) ? existing.sources : []),
        ...vol.json.sources,
      ]);
      merged.sources = [...srcSet];

      const vurl = joinUrl(joinUrl(href, base), vol.name);
      const vres = await fetch(vurl, { method: 'PUT', headers, body: JSON.stringify(merged, null, 2) });
      if (!vres.ok) throw new Error('HTTP ' + vres.status + ' (' + vol.name + ')');
      uploaded++;
    }

    // 4) 上传主机索引（文件名 = rsFile，已带 .json 则不再重复补后缀）。
    const hurl = joinUrl(joinUrl(href, base), payload.hostIndex.name);
    const hres = await fetch(hurl, { method: 'PUT', headers, body: JSON.stringify(payload.hostIndex.json, null, 2) });
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
    optSize: dom.optSize.checked,
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
  // 「汇总文件数与大小」默认开启（文件大小汇总通常都有用）。
  dom.optSize.checked = (s && typeof s.optSize === 'boolean') ? s.optSize : true;
}

/* ---------------- 加载外部 JSON 并展开目录树 ---------------- */
// 清空当前勾选（保留根），便于从加载的清单重新选。
function clearSelection() {
  forEachNode(state.root, (n) => {
    if (n !== state.root) {
      setChecked(n, false, false);
      n._selected = false;
      // 清除「含子目录」递归抓取缓存与标记，回到干净状态。
      if (n._includeSubtree) {
        n._includeSubtree = false;
        n._subtreeGathered = false;
        n.children = [];
        n._loaded = false;
        n._leaf = false;
      }
    }
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

// 把一份已解析的清单（v1 或 v2）应用到当前磁盘树。
// v1：直接 applyManifest；v2 主机索引：按 mounts 逐个拉取卷文件，重组成 v1 合并树后再 applyManifest。
// fetchVolume(mountFileNoExt) => Promise<volObj|null>。
async function applyLoadedDoc(doc, fetchVolume) {
  if (doc && doc.version === 2) {
    const children = [];
    for (const m of (doc.mounts || [])) {
      const vol = await fetchVolume(m.file); // m.file 为不含 .json 的安全键
      if (!vol) continue;
      children.push({
        name: m.letter,
        type: 'folder',
        volumeId: vol.volumeId || m.volumeId || null,
        children: vol.children || [],
      });
    }
    const combined = {
      version: 1,
      source: doc.source,
      generatedAt: doc.generatedAt,
      generator: doc.generator,
      root: { name: doc.source, type: 'folder', children },
    };
    await applyManifest(combined);
    return combined;
  }
  await applyManifest(doc);
  return doc;
}

function loadLocalJSON(file) {
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const doc = JSON.parse(String(reader.result));
      if (doc && doc.version === 2) {
        setStatus('检测到 v2 主机索引：本地单文件不含卷数据，无法重建目录树。请用「从 RS 加载」，或加载 v1 合并清单。', true);
        return;
      }
      await applyManifest(doc);
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
    const doc = await res.json();
    // v2 主机索引需逐个拉取卷文件；v1 直接应用。
    const fetchVolume = async (mountFile) => {
      const vurl = joinUrl(joinUrl(href, base), mountFile + '.json');
      try {
        const vres = await fetch(vurl, { headers: { 'Authorization': 'Bearer ' + token } });
        if (!vres.ok) return null;
        return await vres.json().catch(() => null);
      } catch (_) { return null; }
    };
    const combined = await applyLoadedDoc(doc, fetchVolume);
    // 加载后：按 folder_deepen 里列的目录下钻展示（保留标记，不清空），
    // 使这些深挖目录也在树中出现并带上「深挖」徽章。
    const deepen = await applyDeepenMarks(false);
    renderTree();
    regenerate(combined.generatedAt);
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
dom.optSize.addEventListener('change', () => { renderTree(); regenerate(); });
dom.btnRegen.addEventListener('click', () => { summaryCache.clear(); regenerate(); });
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
[dom.rsHref, dom.rsToken, dom.rsBase, dom.rsFile, dom.optFiles, dom.optSize].forEach((el) => {
  el.addEventListener('change', saveSettings);
});

// 启动时列出本机磁盘，并回填已保存的 UI 参数
loadInitial();
loadSettings();

// 左右分栏拖动：拖动中间分隔条调整「目录树」与「清单预览」的宽度占比。
(function initSplitter() {
  const splitter = $('splitter');
  const layout = document.querySelector('.layout');
  const treePane = $('tree-pane');
  if (!splitter || !layout || !treePane) return;
  let dragging = false;
  splitter.addEventListener('mousedown', (e) => {
    dragging = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rect = layout.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.max(180, Math.min(rect.width - 260, x)); // 左右各留最小宽度
    treePane.style.flex = '0 0 ' + x + 'px';
  });
  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });
})();

// 页面顶部显示程序版本号（来自后端 /api/version，便于识别当前运行的代码版本）
fetch('/api/version')
  .then((r) => r.json())
  .then((d) => { const el = document.getElementById('version'); if (el && d.version) el.textContent = 'v' + d.version; })
  .catch(() => {});
