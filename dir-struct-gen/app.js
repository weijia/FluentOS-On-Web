/* 目录结构清单生成器 — 本地 Web App
 * 功能：浏览本机磁盘树（此电脑 → 驱动器 → 目录，逐层懒加载）→ 勾选要包含的目录
 *       → 生成 RemoteStorage 清单 JSON（可下载 / 复制 / 上传）。
 * 数据源：本地 Node 服务提供的 /api/drives 与 /api/list（服务器端读取真实文件系统，
 *        无需浏览器文件选择器，Firefox / Safari 也可用）。
 * 目录采用懒加载：点开某层才向服务器请求下一层。
 *
 * v2 拆分（主机索引 + 卷文件）：同一块盘（volume）允许存在多份目录结构文件——
 * 每次生成都写一份「分片」`<volumeKey>.<createdAt>.json`（createdAt = 毫秒时间戳；内容带
 * part{id,revision,generatedAt}），旧分片文件名各不相同、互不覆盖，同一卷因此累积多份历史快照；
 * 主机索引只记录每卷的 volumeId 与全部分片文件名（files），读取时按 volumeId 归组、按确定性规则合并。
 * 节点级 updatedAt 为毫秒级 Unix epoch，供合并时「按时间取新」判定。
 */

const $ = (id) => document.getElementById(id);

const state = {
  root: null,       // 此电脑 虚拟根节点（始终存在）
  computerId: null, // 本机 ID（主机名），用于清单根与 RS 文件名默认值
  previewFiles: [], // 当前预览的 v2 拆分文件列表 [{name, content, isHost, partId}]，与上传到 RS 的内容一致
  shardIndex: {},   // 卷索引键 -> 已知分片基名数组（来自远端列举 / 加载到的 mounts.files），
                    // 供预览与主机索引的 mounts.files 列出同一卷的全部分片
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
      // 承接后端 /api/list 返回的两个数值（逻辑大小 + 占用磁盘空间），供「包含文件」时写入清单。
      // 后端取不到时会缺省（不写假 0），这里也就跟着缺省。
      if (typeof it.size === 'number') k.size = it.size;
      if (typeof it.sizeOnDisk === 'number') k.sizeOnDisk = it.sizeOnDisk;
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

  // 目录大小徽标：只要该目录「已有缓存的汇总」（含子孙的文件数与总大小）就展示，
  // 不再要求它当前被勾选——未选中、但历史上曾作为某次子树扫描的一部分被取过的目录，
  // 也能继续显示大小。getSummary 只查本地路径级缓存，**不会**为未选中目录发起请求；
  // 缓存里没有该目录时返回 null，即不显示、也不主动获取。
  const sizeInfo = document.createElement('span');
  sizeInfo.className = 'size-info';
  let hasSize = false;
  const sum = node.kind === 'dir' ? getSummary(node.path) : null;
  if (sum) {
    // 数值只是下界（子树里有读不到或超出深度上限的部分）时加「≥」前缀，避免被当成精确值。
    // 徽标同时展示两个数值：逻辑大小（大小）与占用磁盘空间（占用）。
    sizeInfo.textContent = (sum.partial ? '≥ ' : '') + formatCount(sum.fileCount) + ' 项 · 大小 ' + formatSize(sum.totalSize)
      + (typeof sum.totalSizeOnDisk === 'number' ? ' · 占用 ' + formatSize(sum.totalSizeOnDisk) : '');
    const upd = sum.at ? ' · 更新于 ' + new Date(sum.at).toLocaleTimeString() : '';
    sizeInfo.title = '文件数 ' + sum.fileCount
      + ' · 逻辑大小合计 ' + sum.totalSize + ' 字节'
      + (typeof sum.totalSizeOnDisk === 'number' ? ' · 占用磁盘空间合计 ' + sum.totalSizeOnDisk + ' 字节' : '')
      + upd
      + (sum.partial ? '（下界：子树里有读不到或超出深度上限的部分）' : '');
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

  // 刷新按钮：该目录「已加入索引（勾选/半选）」或「已有大小缓存」时均显示，
  // 作为「获取 / 刷新大小」的统一入口。这样即便 optSize（自动汇总）未开、自动汇总未触发，
  // 用户勾选目录后也能立刻点 ↻ 主动获取大小，而不必等到某次 /api/summary 被缓存。
  const canRefresh = node.kind === 'dir' && (node.checked || node.indeterminate || hasSize);
  if (canRefresh) {
    const rbtn = document.createElement('button');
    rbtn.type = 'button';
    rbtn.className = 'refresh-btn';
    rbtn.textContent = '↻';
    rbtn.title = '刷新该目录的大小（重新扫描磁盘，仅更新此目录及其子树）';
    rbtn.addEventListener('click', (ev) => { ev.stopPropagation(); refreshSummary(node); });
    if (hasSize) row.append(twisty, cb, name, sizeInfo, rbtn, tag);
    else row.append(twisty, cb, name, rbtn, tag);
  } else {
    row.append(twisty, cb, name, tag);
  }

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
    } else {
      // 文件节点：承接后端 /api/tree 带回来的两个数值（逻辑大小 + 占用磁盘空间；取不到则缺省）。
      if (typeof t.size === 'number') child.size = t.size;
      if (typeof t.sizeOnDisk === 'number') child.sizeOnDisk = t.sizeOnDisk;
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
      // 开启「汇总文件大小」且后端给出数值时，把两个数值都写入清单：
      //   size       = 该文件的逻辑大小；
      //   sizeOnDisk = 该文件的占用磁盘空间（后端在取不到占用时已按它的逻辑大小替代）。
      // 后端取不到数值时不写字段（不写假 0）；0 字节文件的真实 0 会照常写入。
      if (ctx.includeSizes && typeof c.size === 'number') f.size = c.size;
      if (ctx.includeSizes && typeof c.sizeOnDisk === 'number') f.sizeOnDisk = c.sizeOnDisk;
      // 文件占位同样带「最后确认时间」：合并时同名文件的属性（如 size）也能按时间取新。
      if (ctx.scanAt) f.updatedAt = ctx.scanAt;
      children.push(f);
    }
  }
  // 标签（自动 + 手动，去重）合并进清单，便于读取侧按标签筛选/展示。
  const merged = [...new Set([...(node.tags || []), ...(node.manualTags || [])])];
  const out = { name: node.name, type: 'folder', children };
  // 节点级「最后确认时间」：毫秒级 Unix epoch，供多分片合并时按时间取新；
  // 缺失该字段的旧文件由读取侧按 ISO 字符串兼容（见 toEpochMs）。
  if (ctx.scanAt) out.updatedAt = ctx.scanAt;
  // 驱动层节点带稳定 volumeId（来自磁盘根 .dir-struct-id），供读取侧去重 / 命名深挖标记；
  // 子目录不重复携带，靠祖先驱动节点溯源即可。
  if (node.volumeId) out.volumeId = node.volumeId;
  // 底部节点标记：仅当磁盘上确实无子目录（加载后 children 为空）时写入。
  // 读取侧据此把该目录直接当底部节点，省去一次磁盘 /api/list 请求。
  if (node._leaf) out.leaf = true;
  if (merged.length) out.tags = merged;
  // 目录汇总：该目录「整棵物理子树」的两套数值 —— 与子目录/文件是否被单独勾选、是否单独出现在
  // 清单里都无关。凡是列进清单的目录（含半选目录）都带上它们。
  //   totalSize       = 子树里所有文件的逻辑大小之和；
  //   totalSizeOnDisk = 子树里所有文件的占用磁盘空间之和（取不到占用的文件按其逻辑大小替代）。
  // 数据来自后端 /api/summary 的批量预取：前端以「会进清单的目录」为扫描根，后端对每个根递归
  // 统计整棵子树，返回 path -> {fileCount,totalSize,totalSizeOnDisk,partial?} 的完整映射；
  // 因此这里只做查表，前端不再逐目录发请求。
  if (ctx.includeSizes && node.path) {
    const sum = getSummary(node.path); // 直查路径级缓存（含该目录整棵子树曾被一次性取回）
    if (sum) {
      out.fileCount = sum.fileCount;
      out.totalSize = sum.totalSize;
      if (typeof sum.totalSizeOnDisk === 'number') out.totalSizeOnDisk = sum.totalSizeOnDisk;
      // 下界标记：该子树里有读不到（超时/权限）或触到递归深度上限的部分时，数值只是下界。
      // 透传到清单，读取侧据此知道这个大小不是精确值（也绝不把读不到伪装成 0）。
      if (sum.partial) out.sizePartial = true;
      node._summary = sum; // 缓存到树节点，供树形视图展示目录大小
    }
  }
  return out;
}

// 清空所有树节点上缓存的目录大小（_summary）。每次重新生成清单前调用：
// buildManifestAsync 遍历时只对「当前在索引里」的目录重新挂上 _summary，它是**清单输出**
// 的字段来源（只写选中目录）；树形视图的大小徽标则直接查路径级缓存 getSummary()，
// 不依赖 _summary，因此未选中但曾取过大小的目录仍可正常显示。
function clearSummaries(node) {
  if (!node) return;
  delete node._summary;
  for (const c of (node.children || [])) clearSummaries(c);
}

// 收集「需要扫描文件大小」的最小独立目录根：遍历整棵选择树，找出所有 checked / indeterminate
// 的目录节点，但**排除那些祖先（不含自身、不含虚拟根「此电脑」）已经是扫描根、因而已被整段覆盖
// 的节点**——它们的子树会被祖先那一次扫描连带统计，无需自成一根。
// 返回的节点彼此不存在父子包含关系，后端对每个根递归扫描各自子树。
//
// 为什么半选(indeterminate)也要成根：口径是「目录大小 = 该目录整棵物理子树的逻辑大小之和，
// 与子目录/文件是否被单独勾选或展示无关」。半选目录同样会出现在清单里，因此它也必须带上覆盖
// 整棵子树的大小——这只能靠把它本身作为扫描根扫一次；若只扫它内部被勾选的子孙，它自身的大小
// 会缺失，或者只覆盖被选中的那一部分，与口径不符。
// 代价：只选了大盘里少数目录时，该盘的盘根也会被整扫一次（结果按路径缓存，不会重复扫盘）。
function collectSummaryRoots(node, ancestorCovered) {
  const result = [];
  const isRealDir = node.kind === 'dir' && node.path;
  // 扫描根只认「整目录勾选(checked)」的目录。indeterminate（仅部分后代被选中）**不是**独立扫描根——
  // 它的已选后代会各自成为根；若把半选祖先当根，会遇到「只选了个深层目录，却请求整块父盘(如 C:\) 并扫整盘」。
  const selected = !!node.checked;
  if (isRealDir && selected && !ancestorCovered) result.push(node);
  // 向下覆盖规则：本节点整目录勾选时，其后代无需再独立成根（那次扫描已覆盖它们）。
  // 虚拟根「此电脑」没有真实路径（isRealDir=false），checked 只是容器语义，不向下覆盖。
  // 注意：半选(indeterminate)祖先不向下覆盖（它没整选），其 checked 后代仍会被独立收集为根。
  const childAncestorCovered = ancestorCovered || (isRealDir && selected);
  for (const c of (node.children || [])) {
    if (c.kind === 'dir') result.push(...collectSummaryRoots(c, childAncestorCovered));
  }
  return result;
}

// 文件大小汇总缓存：按「单个目录路径」缓存 /api/summary 的结果。后端对每个根递归统计整棵子树，
// 单次请求即返回该根下所有目录（含子孙）的 fileCount/totalSize；前端把返回的每个目录都写进本缓存，
// 因此「取消勾选/重选」导致扫描根集合变化时，已扫描过的子树仍命中本缓存，绝不会重复扫描整块父目录。
// 永不自动过期：目录大小只在用户手动点某目录的「刷新」按钮、或点「重新生成」(summaryCache.clear()) 时更新；
// 因此隔多久再访问同一目录都不会产生多余的 /api/summary 请求。at 仅用于显示「上次更新时间」。
const summaryCache = new Map(); // path -> { fileCount, totalSize, totalSizeOnDisk, partial?, at }，partial=true 表示数值只是下界

// 从路径级缓存取某目录的汇总；命中即返回（永不自动过期，缺失返回 null）。后端曾把该目录连同其整棵
// 子树一起返回并写入缓存，故直接查本缓存即可拿到「含子孙」的任意目录大小，无需重新请求后端。
function getSummary(path) {
  if (!path) return null;
  return summaryCache.get(path) || null;
}

// 目录浏览缓存：按「绝对路径」缓存该目录已加载的子项列表，跨节点对象重建（加载 JSON 清单、
// 切换「含子目录」等会把 _loaded 重置的场景）依然有效，从根上避免对同一个目录重复请求 /api/list。
// 键区分是否含文件大小两种返回（needSizes），二者数据结构不同。TTL 内复用，过期后重新拉取以反映磁盘变化。
const dirCache = new Map(); // key(path + '#s'|'') -> { items, at }
const DIR_CACHE_TTL = 5 * 60 * 1000; // 5 分钟

// 汇总请求的分批参数：把缺失根分批发给后端（?path=A&path=B&…），每批独立超时、独立写缓存。
// 为什么分批：把「半选盘根」也纳入扫描根之后（见 collectSummaryRoots），单次请求可能要扫很大
// 的子树，而旧实现是整轮 all-or-nothing —— 一次超时就丢掉全部目录的大小。分批后某批失败只
// 影响该批，已成功批次的数值照常进缓存并被清单采用，下一轮 regenerate 只重试缺失的根。
const SUMMARY_BATCH_SIZE = 4;
const SUMMARY_BATCH_TIMEOUT_MS = 180000; // 单批最长等待时间

// 把「会进清单的目录」里【尚未缓存】的根分批发给后端，取回它们各自子树（含所有子孙目录）的
// 大小映射；其余根直接复用路径级缓存（含其整棵子树），绝不重复扫描磁盘。
// rootPaths：最小独立扫描根（已被 collectSummaryRoots 排除掉被祖先覆盖的目录，故彼此无包含关系）。
async function fetchAllSummaries(rootPaths) {
  if (!rootPaths || !rootPaths.length) return;
  const uniq = [...new Set(rootPaths)];
  // 只挑「路径级缓存缺失」的根（缓存永不自动过期，故只看在不在）；由于之前取某根时已将其整棵子树
  // 一并写入缓存，命中缓存的根意味着它和它所有子孙都已在缓存，无需再请求——取消勾选/重选都不会重扫父目录。
  const missing = uniq.filter(p => !summaryCache.has(p));
  if (missing.length === 0) return; // 全部命中缓存，后端零请求
  const now = Date.now();
  for (let i = 0; i < missing.length; i += SUMMARY_BATCH_SIZE) {
    const batch = missing.slice(i, i + SUMMARY_BATCH_SIZE);
    setStatus('正在汇总目录大小…（' + Math.min(i + batch.length, missing.length) + '/' + missing.length + '）');
    const q = batch.map(p => 'path=' + encodeURIComponent(p)).join('&');
    // 前端超时兜底：单批最多等 3 分钟；超时/失败只放弃该批（不写脏缓存），绝不阻断清单生成，
    // 也不会连带丢掉其他批已取回的大小。
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), SUMMARY_BATCH_TIMEOUT_MS);
    try {
      const res = await fetch('/api/summary?' + q, { signal: ctrl.signal });
      if (!res.ok) continue;
      const data = await res.json();
      const sums = (data && data.summaries) || {};
      // 把后端返回的每一个目录（含所有子孙）都写进路径级缓存，供本次及后续（扫描根变化后）直接复用。
      for (const [k, v] of Object.entries(sums)) {
        summaryCache.set(k, {
          fileCount: v.fileCount,
          totalSize: v.totalSize,
          totalSizeOnDisk: v.totalSizeOnDisk,
          partial: !!v.partial,
          at: now,
        });
      }
    } catch (_) {
      // 本批失败/超时：不写脏缓存；其他批不受影响，下次 regenerate 仍会重试本批缺失根。
    } finally {
      clearTimeout(timer);
    }
  }
}

// 手动刷新某个目录的大小：只向 /api/summary 请求该目录（含其整棵子树），把返回写入路径级缓存，
// 然后触发 regenerate —— 由于缓存已被本次结果填满，regenerate 不会再发任何 /api/summary 请求，
// 仅把最新的 fileCount/totalSize 反映到目录行徽标与预览清单上。用于「缓存不过期」策略下，
// 用户想让某个目录的大小反映磁盘最新变化时的主动刷新入口。
async function refreshSummary(node) {
  if (!node || node.kind !== 'dir' || !node.path) return;
  setStatus('正在刷新 ' + node.path + ' 的大小…');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 180000);
  try {
    const res = await fetch('/api/summary?path=' + encodeURIComponent(node.path), { signal: ctrl.signal });
    if (!res.ok) { setStatus('刷新失败：HTTP ' + res.status); return; }
    const data = await res.json();
    const sums = (data && data.summaries) || {};
    const now = Date.now();
    // 把返回的每一个目录（含子孙）写进路径级缓存；已存在则覆盖为最新值（含下界标记）。
    for (const [k, v] of Object.entries(sums)) {
      summaryCache.set(k, {
        fileCount: v.fileCount,
        totalSize: v.totalSize,
        totalSizeOnDisk: v.totalSizeOnDisk,
        partial: !!v.partial,
        at: now,
      });
    }
    regenerate(); // 重渲染树徽标 + 刷新预览清单（缓存已是最新，不会产生新的网络请求）
    const s = summaryCache.get(node.path);
    setStatus('已刷新 ' + node.path + ' 的大小'
      + (s ? ('（' + (s.partial ? '≥ ' : '') + formatCount(s.fileCount) + ' 项 · 大小 ' + formatSize(s.totalSize)
        + (typeof s.totalSizeOnDisk === 'number' ? ' · 占用 ' + formatSize(s.totalSizeOnDisk) : '') + '）') : '')
      + (s && s.partial ? '；该数值为下界（子树里有读不到或超出深度上限的部分）' : ''));
  } catch (e) {
    setStatus('刷新失败：' + (e && e.message ? e.message : e));
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
  // scanAt：本次扫描的确认时间（毫秒级 epoch），写入每个节点的 updatedAt——
  // 语义是「该目录/文件最后一次被扫描确认存在的时间」，多分片合并时按它取新。
  const ctx = { includeFiles, includeSizes, scanAt: Date.now() };
  // 仅当开启了「汇总文件数与大小」时，才去后端拿文件数与总大小。
  // 口径：目录大小 = 该目录整棵物理子树里所有文件的逻辑大小之和，与子目录/文件是否被单独勾选、
  // 是否单独出现在清单里都无关；因此扫描根取「会进清单的目录（勾选或半选）的最小独立子集」——
  // 半选目录也要自己成根，才能带上覆盖整棵子树的大小（细则见 collectSummaryRoots 与格式文档）。
  // 前端把根分批交给 /api/summary，后端递归返回每棵子树全部目录的大小，前端不逐目录请求；
  // 结果按路径进 summaryCache（本会话内不自动过期，只有「重新生成」或手动刷新才更新）。
  // 先清空旧的大小缓存（节点上的 _summary）：仅「当前在索引里」的目录会在下方遍历时重新挂上
  // _summary，取消勾选（或祖先被取消）的目录不再被遍历，从而树里只显示已加入索引目录的大小。
  if (state.root) clearSummaries(state.root);
  // 先对用到的盘惰性写入稳定身份标记（异步，不阻塞；失败回退序列号）。
  await ensureDriveVolumeIds();
  if (includeSizes && state.root) {
    const roots = collectSummaryRoots(state.root); // 会进清单目录的最小独立扫描根（仅整目录勾选 checked；半选祖先不自成根，避免误扫整盘）
    // 把「尚未缓存」的根分批发给后端；已缓存（含各自整棵子树）的根直接命中 summaryCache，
    // 取消勾选/重选导致根集合变化时也不会重复扫描父目录。
    await fetchAllSummaries(roots.map(r => r.path));
  }
  const rootManifest = await buildManifestAsync(state.root, includeFiles, ctx);
  // 给每个写进清单的文件/目录补上各自的「最后修改时间」(mtime)：在清单树生成完之后，
  // 按实际写入的节点批量向后端取，覆盖含子目录已展开的子树，且不拖慢日常浏览。
  await attachMtimes(rootManifest, includeFiles);
  return {
    version: 1,
    generatedAt: genAt || new Date().toISOString(),
    generator: 'fluentos-dir-struct-gen',
    source: state.root.name,
    root: rootManifest,
  };
}

// 把文件/目录的「最后修改时间」(mtime, 毫秒 epoch) 批量挂到清单节点上。
// 与目录大小(聚合值、按需预取)不同，mtime 是「单个节点的物理属性」：在清单树生成完之后，
// 按「实际写进清单的节点」一次性向后端批量取（含含子目录已展开的子树），保证 JSON 里每个
// 文件/目录都带自己的 mtime，且不拖慢日常浏览（浏览时完全不取 mtime）。
// 与 buildManifestAsync 同口径：目录节点在 checked/indeterminate 时写入并下钻；文件节点在
// 「包含文件」且 checked 时写入。仅这些节点会被取 mtime。
async function attachMtimes(rootManifest, includeFiles) {
  // 1) 收集「清单节点 ↔ 内存树节点」配对（以 name 对齐，避免顺序错位），只含真正写进清单的节点。
  const pairs = [];
  (function walk(treeNode, manifestNode) {
    if (!treeNode || !manifestNode) return;
    pairs.push([treeNode, manifestNode]);
    const mcByName = new Map((manifestNode.children || []).map((m) => [m.name, m]));
    for (const c of (treeNode.children || [])) {
      const mn = mcByName.get(c.name);
      if (!mn) continue;
      if (c.kind === 'dir') {
        if (c.checked || c.indeterminate) walk(c, mn);
      } else if (includeFiles && c.checked) {
        pairs.push([c, mn]);
      }
    }
  })(state.root, rootManifest);

  // 2) 取所有有磁盘路径的节点，分批并发请求 mtime（避免一次性几万个 stat 压垮 libuv）。
  const paths = pairs.map((t) => t[0].path).filter(Boolean);
  if (!paths.length) return;
  const CHUNK = 2000;        // 每批路径数
  const CONCURRENCY = 6;     // 并发批数
  const map = {};
  let idx = 0;
  async function worker() {
    while (idx < paths.length) {
      const start = idx;
      idx += CHUNK;
      const slice = paths.slice(start, idx);
      try {
        const res = await fetch('/api/mtimes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: slice }),
        });
        if (!res.ok) continue;
        const part = await res.json();
        for (const k in part) map[k] = part[k];
      } catch (_) { /* 单批失败不影响其它批 */ }
    }
  }
  const batches = Math.ceil(paths.length / CHUNK);
  const workers = [];
  for (let i = 0; i < Math.min(CONCURRENCY, batches); i++) workers.push(worker());
  await Promise.all(workers);

  // 3) 回写 mtime 到清单节点（仅当后端确实返回数值时才写，不写假值）。
  for (const [t, mn] of pairs) {
    const m = map[t.path];
    if (typeof m === 'number') mn.mtime = m;
  }
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
      ...payload.volumes.map((v) => ({
        name: v.name,
        content: JSON.stringify(v.json, null, 2),
        isHost: false,
        partId: (v.json.part && v.json.part.id) || '',
      })),
    ];
  }
  renderPreview();
  updateCount();
}

// 由完整 manifest(version:1) 构建 v2 拆分的「上传载荷」——预览与上传共用同一份，确保两者一致。
// 每块盘写一份「分片」：文件名 = <volumeKey>.<createdAt>.json（createdAt = 本次生成的毫秒时间戳）。
// 每次生成都带全新时间戳，因此上传不会覆盖以前生成的文件——同一卷会累积多份历史分片，
// 主机索引的 mounts 只记录该卷的 volumeId 与全部分片文件名（files），供读取侧按 volumeId 合并成一棵树。
// 返回 { hostIndex: {name, json}, volumes: [{key, base, name, json}] }。
function buildV2Payload(manifest, file) {
  const drives = (manifest.root.children || []).filter((d) => d.type === 'folder');
  const createdAt = Date.now();                  // 本次生成的时间戳：同一卷每次生成一个全新分片文件名，互不覆盖
  const partId = partIdFor();                    // 本机身份（用于分片 part.id 与合并 tie-break，不参与文件名）
  const mounts = [];
  const volumes = drives.map((d) => {
    const indexKey = volumeKeyFor(d);             // 卷索引键（原始，未脱敏）
    const volumeKey = sanitizeKey(indexKey);      // RemoteStorage 文件名安全键（= 卷分片文件名前缀）
    const ownBase = shardBaseName(volumeKey, createdAt);
    const bases = volumeShardBases(indexKey, ownBase); // 该卷全部分片基名（远端已存在的 + 本次自己的）
    // 主机索引只记录「卷身份 + 全部分片文件名」：volumeId 是稳定身份，files 是该卷累积的全部分片。
    // 读取侧据此把同一卷的所有分片（含历史）合并成一棵树，且不依赖任何主机/盘符信息。
    mounts.push({
      volumeId: d.volumeId || null,
      files: bases,
    });
    const json = {
      volumeId: d.volumeId || null,
      name: d.name,
      type: 'folder',
      // part：本分片的身份（id 默认本机主机名）、版本号（每次成功上传 +1）与生成时间（毫秒 epoch）。
      part: {
        id: partId,
        revision: revisionFor(revisionKey(volumeKey, partId)),
        generatedAt: createdAt,
      },
      children: d.children,
      sources: [manifest.source],
    };
    return { key: indexKey, base: ownBase, name: ownBase + '.json', json };
  });
  const hostIndex = {
    version: 2,
    source: manifest.source,
    generatedAt: manifest.generatedAt,
    generator: manifest.generator,
    mounts,
  };
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
    title.textContent = f.name + (f.isHost
      ? '（主机索引 · v2）'
      : '（卷文件分片 · v2' + (f.partId ? ' · ' + f.partId : '') + '）');
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

/* ---------------- v2 分片：命名、发现与合并 ----------------
 * 同一块盘（volume）允许存在多份目录结构文件：每台主机写自己的一份「分片」
 * （<volumeId>.<createdAt>.json，内容带 part{id,revision,generatedAt}），互不覆盖，
 * 读取时按 volumeId 归组后合并成一棵树。
 * 合并规则（确定性、幂等）：
 *   1) children 永远取并集——某台机没扫到不代表目录不存在，绝不因为「另一份更新」而抹掉别人的目录；
 *   2) 同名节点的属性按「最后确认时间」取新：节点 updatedAt 优先，回退所属文件的 part.generatedAt /
 *      generatedAt（时间字段兼容旧的 ISO 字符串写法）；
 *   3) tags / sources 取并集去重（累积信息，不该被时间覆盖）；
 *   4) leaf 重算：合并后有子目录就不再是底部节点（否则读取侧不显示展开按钮，深挖出的层会被藏住）；
 *   5) 同名类型冲突（folder vs file）：folder 优先，不看时间（file 只是占位、不读内容）；
 *   6) 时间缺失、或两侧时间相差不超过 MERGE_TIME_TOLERANCE_MS → 按 part.id 字典序取大者兜底，
 *      保证同一组输入永远得到同一棵树（便于 diff / 缓存）。
 */

// 判定「同一时刻」的容差：两侧时间差不超过该值即视为同时，改用 part.id 兜底——多机时钟未必同步。
const MERGE_TIME_TOLERANCE_MS = 5 * 60 * 1000;

// 把时间戳统一成毫秒 epoch：数字直接采信；字符串按 ISO 解析（兼容早先写入的 ISO 字符串）；
// 其它或缺失返回 null，由合并规则走 part.id 兜底。
function toEpochMs(v) {
  if (typeof v === 'number' && isFinite(v)) return v;
  if (typeof v === 'string' && v) {
    const t = Date.parse(v);
    return isNaN(t) ? null : t;
  }
  return null;
}

// 取两者中较新的时间戳（缺失视为未知，不参与比较）。
function maxStamp(x, y) {
  if (x == null) return y == null ? null : y;
  if (y == null) return x;
  return Math.max(x, y);
}

// 节点的「最后确认时间」：优先节点自身的 updatedAt，其次所属文件的时间。
function nodeStamp(node, fileStamp) {
  const own = toEpochMs(node && node.updatedAt);
  return own != null ? own : toEpochMs(fileStamp);
}

// 冲突归属：时间较新者胜；时间缺失或相差在容差内 → 按 part.id 字典序取大者（确定性兜底）。
function pickNewerSide(aStamp, bStamp, aPart, bPart) {
  const a = toEpochMs(aStamp), b = toEpochMs(bStamp);
  if (a != null && b != null && Math.abs(a - b) > MERGE_TIME_TOLERANCE_MS) return a > b ? 'a' : 'b';
  const pa = aPart || '', pb = bPart || '';
  if (pa === pb) return 'a'; // 同一分片自比（幂等）
  return pa > pb ? 'a' : 'b';
}

// 清单 children 的确定性排序：目录优先 + 名称数字感知，与树形视图 sortChildren 同一口径。
function sortManifestChildren(children) {
  children.sort((x, y) => {
    const xf = (x.type || 'folder') === 'folder';
    const yf = (y.type || 'folder') === 'folder';
    if (xf !== yf) return xf ? -1 : 1;
    return String(x.name).localeCompare(String(y.name), undefined, { numeric: true });
  });
  for (const c of children) if (Array.isArray(c.children)) sortManifestChildren(c.children);
  return children;
}

// 合并两棵子树 / 两份卷文件。ctx: { aPart, bPart, aStamp, bStamp }（首次调用传文件级 part 与时间）。
function mergeVolumeTrees(a, b, ctx) {
  // 顶层调用（未标记）：先按替代规则补齐两侧缺失的「占用磁盘空间」值。
  // 「取不到占用就用逻辑大小替代」是规定行为；入口统一补齐后，递归与「max(各来源值, 子项之和)」
  // 都在同一口径下进行，也让同一组输入重复合并得到完全一致的结果（幂等）。
  if (!ctx || !ctx._diskFilled) {
    fillDiskValuesDeep(a);
    fillDiskValuesDeep(b);
    ctx = Object.assign({}, ctx || {}, { _diskFilled: true });
  }
  ctx = ctx || {};
  const aPart = ctx.aPart || '';
  const bPart = ctx.bPart || '';
  const aStamp = nodeStamp(a, ctx.aStamp);
  const bStamp = nodeStamp(b, ctx.bStamp);

  // 1) 同名类型冲突：folder 优先（file 只是占位、不读内容），不看时间。
  const aFolder = (a.type || 'folder') === 'folder';
  const bFolder = (b.type || 'folder') === 'folder';
  const keepA = (aFolder !== bFolder) ? aFolder : (pickNewerSide(aStamp, bStamp, aPart, bPart) === 'a');

  // 2) children 永远取并集（与时间无关）：同名节点递归合并，其余直接并入。
  const map = new Map();
  const put = (child, sidePart, sideStamp) => {
    const key = child.name;
    if (!map.has(key)) {
      map.set(key, { node: child, part: sidePart, stamp: sideStamp });
      return;
    }
    const prev = map.get(key);
    map.set(key, {
      node: mergeVolumeTrees(prev.node, child, {
        aPart: prev.part, bPart: sidePart, aStamp: prev.stamp, bStamp: sideStamp, _diskFilled: true,
      }),
      // 归并后的 part 取字典序较大者、时间取较新者，保证后续再合并时判定仍确定。
      part: (prev.part || '') > (sidePart || '') ? prev.part : sidePart,
      stamp: maxStamp(prev.stamp, sideStamp),
    });
  };
  for (const c of (Array.isArray(a.children) ? a.children : [])) put(c, aPart, aStamp);
  for (const c of (Array.isArray(b.children) ? b.children : [])) put(c, bPart, bStamp);
  const children = sortManifestChildren([...map.values()].map((x) => x.node));

  // 3) 属性取胜者；tags / sources 取并集去重（累积信息，不被时间覆盖）。
  const out = { ...(keepA ? a : b), children };
  const tags = [...new Set([...(a.tags || []), ...(b.tags || [])])];
  if (tags.length) out.tags = tags; else delete out.tags;
  const sources = [...new Set([...(a.sources || []), ...(b.sources || [])])];
  if (sources.length) out.sources = sources; else delete out.sources;
  // volumeId 是驱动层的身份字段（子目录不携带）：两侧谁有就保留谁。
  // 两侧都没有时不要凭空补一个 null——那会让「同一组输入合并两次」得到不同结果，破坏幂等。
  const vid = a.volumeId || b.volumeId;
  if (vid) out.volumeId = vid;

  // 4) leaf 重算：合并后有子目录 → 不再是底部节点；两侧都没见过子目录才算底部。
  if ((out.type || 'folder') === 'folder') {
    const hasFolderChild = children.some((c) => (c.type || 'folder') === 'folder');
    if (hasFolderChild) delete out.leaf;
    else if (a.leaf === true || b.leaf === true) out.leaf = true;
    else delete out.leaf;
  }

  // 5) updatedAt 取两者较新；合并结果不再是单个物理分片 → 去掉 part（写回归档时由调用方重新写 part）。
  const stamp = maxStamp(aStamp, bStamp);
  if (stamp != null) out.updatedAt = stamp; else delete out.updatedAt;
  if (out.part && aPart !== bPart) delete out.part;

  // 6) 两套大小字段都与合并结果保持一致。children 是并集，而两侧的 fileCount / totalSize /
  //    totalSizeOnDisk 各自只覆盖「自己那台机器上的整棵子树」，直接沿用较新一方会出现
  //    「父目录小于清单里可见子项之和」这种无从解释的结果。规则：每个数值分别取
  //    「两侧已有的整棵子树值」与「合并后子项之和」中的较大者——既不会把两台机器对同一份内容的
  //    统计相加造成虚高，也不会自相矛盾；任一侧或任一子项只是下界（sizePartial）时，结果同样标记。
  if ((out.type || 'folder') === 'folder') {
    const sum = sumChildrenTotals(children);
    const aCount = (typeof a.fileCount === 'number') ? a.fileCount : 0;
    const bCount = (typeof b.fileCount === 'number') ? b.fileCount : 0;
    const aSize = (typeof a.totalSize === 'number') ? a.totalSize : 0;
    const bSize = (typeof b.totalSize === 'number') ? b.totalSize : 0;
    const aDisk = (typeof a.totalSizeOnDisk === 'number') ? a.totalSizeOnDisk
      : (typeof a.totalSize === 'number' ? a.totalSize : 0); // 缺占用值 → 按替代规则用逻辑大小顶上
    const bDisk = (typeof b.totalSizeOnDisk === 'number') ? b.totalSizeOnDisk
      : (typeof b.totalSize === 'number' ? b.totalSize : 0);
    const hasAny = !!(aCount || bCount || aSize || bSize || aDisk || bDisk
      || sum.fileCount || sum.totalSize || sum.totalSizeOnDisk);
    if (hasAny) {
      out.fileCount = Math.max(aCount, bCount, sum.fileCount);
      out.totalSize = Math.max(aSize, bSize, sum.totalSize);
      out.totalSizeOnDisk = Math.max(aDisk, bDisk, sum.totalSizeOnDisk);
      if (a.sizePartial || b.sizePartial || sum.partial) out.sizePartial = true;
      else delete out.sizePartial;
    }
  }

  return out;
}

// 按替代规则补齐「占用磁盘空间」值：缺失时用对应的逻辑大小顶上（已有真实占用值时不覆盖）。
// 递归整棵子树——合并入口调用一次，使合并口径统一，并保证同一组输入重复合并结果完全一致。
function fillDiskValuesDeep(node) {
  if (!node || typeof node !== 'object') return;
  if ((node.type || 'folder') === 'file') {
    if (typeof node.sizeOnDisk !== 'number' && typeof node.size === 'number') node.sizeOnDisk = node.size;
    return;
  }
  if (typeof node.totalSizeOnDisk !== 'number' && typeof node.totalSize === 'number') {
    node.totalSizeOnDisk = node.totalSize;
  }
  for (const c of (Array.isArray(node.children) ? node.children : [])) fillDiskValuesDeep(c);
}

// 合并后「子项之和」：子目录取 fileCount / totalSize / totalSizeOnDisk，文件占位取 size / sizeOnDisk。
// 任一项缺数值或本身是下界，都不影响「取较大者」的用法，但会通过 partial 让上层知道结果只是下界。
function sumChildrenTotals(children) {
  let fileCount = 0, totalSize = 0, totalSizeOnDisk = 0, partial = false;
  for (const c of (children || [])) {
    if ((c.type || 'folder') === 'file') {
      fileCount += 1;
      if (typeof c.size === 'number') totalSize += c.size;
      else partial = true;
      // 占用值缺失（早先没有该字段的清单）时按同一替代规则用逻辑大小顶上。
      if (typeof c.sizeOnDisk === 'number') totalSizeOnDisk += c.sizeOnDisk;
      else if (typeof c.size === 'number') totalSizeOnDisk += c.size;
      else partial = true;
    } else {
      if (typeof c.fileCount === 'number') fileCount += c.fileCount;
      else partial = true;
      if (typeof c.totalSize === 'number') totalSize += c.totalSize;
      else partial = true;
      if (typeof c.totalSizeOnDisk === 'number') totalSizeOnDisk += c.totalSizeOnDisk;
      else if (typeof c.totalSize === 'number') totalSizeOnDisk += c.totalSize;
      else partial = true;
    }
    if (c.sizePartial) partial = true;
  }
  return { fileCount, totalSize, totalSizeOnDisk, partial };
}

// 分片标识：默认用本机 ID（主机名）——一块盘在一台机器上的一份选择即一份分片；
// 多台机器各自成片、互不覆盖，读取时按 volumeId 合并。
function partIdFor() {
  return sanitizeKey(state.computerId || 'host');
}

// 分片基名（不含 .json）：<volumeKey>.<createdAt>；createdAt 为本次生成的毫秒时间戳，
// 保证每次生成得到不同文件名、不覆盖以前的分片（同一卷累积多份历史快照）。
function shardBaseName(volumeKey, createdAt) {
  return volumeKey + '.' + createdAt;
}

// 该卷的全部已知分片基名（稳定排序）：远端列举 / 加载到的记入 state.shardIndex，本轮自己的分片始终并入。
function volumeShardBases(indexKey, ownBase) {
  const known = (state.shardIndex && state.shardIndex[indexKey]) || [];
  return [...new Set([...known, ownBase])].sort((a, b) => a.localeCompare(b));
}

// 记录一块盘已知的分片（供预览与主机索引的 mounts.files 复用，随设置一起持久化）。
function rememberShard(indexKey, base) {
  if (!indexKey || !base) return;
  const list = state.shardIndex[indexKey] || (state.shardIndex[indexKey] = []);
  if (!list.includes(base)) list.push(base);
  list.sort((a, b) => a.localeCompare(b));
}

// 缩略分片版本号的存储键：<volumeKey>::<partId>（每台机器自己维护，互不干扰）。
function revisionKey(volumeKey, partId) {
  return volumeKey + '::' + partId;
}

// 分片版本号：内部存的是「已成功上传的版本」，预览读到的是 +1（即下次上传会写入的版本号），
// 因此「预览内容 == 上传内容」；仅本地记录，不影响 manifest 结构。
const PART_REVISION_STORE = 'dirStructGen.partRevisions';
function loadPartRevisions() {
  try { return JSON.parse(localStorage.getItem(PART_REVISION_STORE) || '{}') || {}; } catch (_) { return {}; }
}
function revisionFor(partKey) {
  const n = Number(loadPartRevisions()[partKey] || 0) + 1;
  return (isFinite(n) && n > 0) ? n : 1;
}
function setRevision(partKey, rev) {
  try {
    const revs = loadPartRevisions();
    revs[partKey] = rev;
    localStorage.setItem(PART_REVISION_STORE, JSON.stringify(revs));
  } catch (_) { /* 隐私模式等场景下不可用：下次仍从 1 起算，不影响上传与合并 */ }
}

// 卷索引键：优先稳定身份 volumeId，其次回退「主机::盘符」（与 volumeKeyFor 同源）。
function volumeIndexKey(volumeId, letter, source) {
  return volumeId ? String(volumeId) : ((source || state.computerId || '') + '::' + letter);
}

// 分片文件所属的 part.id（旧文件可能没有 part，则回退取 sources[0]）。
function partIdOfDoc(doc) {
  if (!doc) return '';
  if (doc.part && doc.part.id) return String(doc.part.id);
  if (Array.isArray(doc.sources) && doc.sources.length) return String(doc.sources[0]);
  return '';
}

// 分片文件的整体时间戳：优先 part.generatedAt，其次顶层 generatedAt（兼容早先的 ISO 字符串）。
function docStamp(doc) {
  if (!doc) return null;
  if (doc.part) {
    const t = toEpochMs(doc.part.generatedAt);
    if (t != null) return t;
  }
  return toEpochMs(doc.generatedAt);
}

// 列出 base 目录下已有的文件名。RemoteStorage 的目录 listing 是 GET 该目录返回的 JSON 对象：
// { "xxx.json": {"ETag":...}, "sub/": {...} }——以 / 结尾的是子目录，这里只取文件。
async function listRemoteFiles(href, token, base) {
  const url = joinUrl(href, base);
  try {
    const res = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
    });
    if (!res.ok) return [];
    const obj = await res.json().catch(() => null);
    if (!obj || typeof obj !== 'object') return [];
    return Object.keys(obj).filter((k) => !k.endsWith('/'));
  } catch (_) { return []; }
}

// 从远端列举结果里挑出某卷的全部分片基名（含旧版单文件 <volumeKey>.json）并记入索引。
function collectShardsFor(indexKey, volumeKey, names) {
  for (const n of names) {
    if (!n.endsWith('.json')) continue;
    const base = n.slice(0, -'.json'.length);
    if (base === volumeKey || base.startsWith(volumeKey + '.')) rememberShard(indexKey, base);
  }
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

    // 2) 先摸清远端 base 下已有哪些文件：同一卷的其他分片、旧版单文件都要写进 mounts.files，
    //    供读取侧把它们合并起来（列举失败不阻断上传，只是本轮索引里少列几份）。
    const names = await listRemoteFiles(href, token, base);
    if (names.length) {
      for (const d of (state.root.children || [])) {
        if (d.kind !== 'dir' || !d.path) continue;
        collectShardsFor(volumeKeyFor(d), sanitizeKey(volumeKeyFor(d)), names);
      }
    }

    // 3) 复用与预览相同的 v2 拆分逻辑，保证「上传内容 == 预览内容」。
    const manifest = await generateManifest();
    const payload = buildV2Payload(manifest, file);
    await saveSettings(); // 记住已知分片，刷新后预览仍能列出同一卷的全部分片

    // 4) 只写自己本次的分片（<volumeId>.<createdAt>.json，全新文件名）：不再「读别人的文件 → 合并 → 写回同一文件」，
    //    因此多台主机同时上传也不会互相覆盖、丢更新；完整目录树由读取侧按 volumeId 合并得到。
    const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
    let uploaded = 0;
    const revs = [];
    for (const vol of payload.volumes) {
      const vurl = joinUrl(joinUrl(href, base), vol.name);
      const vres = await fetch(vurl, { method: 'PUT', headers, body: JSON.stringify(vol.json, null, 2) });
      if (!vres.ok) throw new Error('HTTP ' + vres.status + ' (' + vol.name + ')');
      uploaded++;
      rememberShard(vol.key, vol.base);
      revs.push([
        revisionKey(sanitizeKey(vol.key), vol.json.part.id),
        vol.json.part.revision,
      ]);
    }

    // 5) 上传主机索引（文件名 = rsFile，已带 .json 则不再重复补后缀）。
    const hurl = joinUrl(joinUrl(href, base), payload.hostIndex.name);
    const hres = await fetch(hurl, { method: 'PUT', headers, body: JSON.stringify(payload.hostIndex.json, null, 2) });
    if (!hres.ok) throw new Error('HTTP ' + hres.status + ' (host index)');

    // 6) 上传成功后落盘分片版本号（下次生成时 +1），并持久化已知分片清单。
    for (const [k, r] of revs) setRevision(k, r);
    await saveSettings();

    let msg = '上传成功：' + uploaded + ' 个卷分片 + 主机索引';
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
    // 已知分片清单（卷索引键 -> 基名数组）：只影响预览与主机索引里 mounts.files 的列全，
    // 不参与合并判定（合并只看文件内容里的 volumeId / part）。
    shardIndex: state.shardIndex || {},
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
  // 回填「已知分片清单」：预览与主机索引的 mounts.files 据此把同一卷的全部分片列全。
  const si = (s && s.shardIndex && typeof s.shardIndex === 'object') ? s.shardIndex : {};
  state.shardIndex = {};
  for (const [k, v] of Object.entries(si)) {
    if (Array.isArray(v)) {
      state.shardIndex[k] = v.filter((x) => typeof x === 'string')
        .sort((a, b) => a.localeCompare(b));
    }
  }
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
// v1：直接 applyManifest；v2 主机索引：对每个 mounts 项读取该卷的**全部分片**
// （优先 mounts.files，缺失则回退 mounts.file），按 part 元信息合并成一棵树后再 applyManifest。
// fetchVolume(volumeFileBase) => Promise<volObj|null>，参数为不含 .json 的基名。
async function applyLoadedDoc(doc, fetchVolume) {
  if (doc && doc.version === 2) {
    const children = [];
    for (const m of (doc.mounts || [])) {
      // 同一块盘的多份目录结构文件：files（新格式，对象数组）> file（旧格式，单基名）。
      const bases = (Array.isArray(m.files) && m.files.length
        ? m.files.map((f) => (typeof f === 'string' ? f : (f && f.file))).filter(Boolean)
        : (m.file ? [m.file] : []))
        .sort((a, b) => a.localeCompare(b)); // 固定折叠顺序 → 合并结果确定
      const indexKey = volumeIndexKey(m.volumeId, m.letter, doc.source);
      let acc = null; // { doc, part, stamp }
      for (const base of bases) {
        const vol = await fetchVolume(base);
        if (!vol) continue;
        rememberShard(indexKey, base);
        const side = { doc: vol, part: partIdOfDoc(vol), stamp: docStamp(vol) };
        if (!acc) { acc = side; continue; }
        const merged = mergeVolumeTrees(acc.doc, side.doc, {
          aPart: acc.part, bPart: side.part, aStamp: acc.stamp, bStamp: side.stamp,
        });
        acc = {
          doc: merged,
          part: (acc.part > side.part ? acc.part : side.part),
          stamp: maxStamp(acc.stamp, side.stamp),
        };
      }
      if (!acc) continue;
      const vol = acc.doc;
      const drive = {
        name: m.letter,
        type: 'folder',
        volumeId: vol.volumeId || m.volumeId || null,
        children: sortManifestChildren(vol.children || []),
      };
      if (vol.tags) drive.tags = vol.tags;
      children.push(drive);
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
