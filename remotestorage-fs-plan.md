# FluentOS-On-Web 文件管理器接入 RemoteStorage 目录树 — 详细分析设计

> 状态：需求与关键设计已澄清，待开发。
> 关联：`c:/codes/nodejs/todo.md` 项目 3；上游库 `c:/codes/nodejs/zen-fs-remotestoragejs`。
> 本期范围：**只读展示某个 RemoteStorage 连接下的目录层级**，数据源有两种——
> (A) RemoteStorage 真实文件夹层级；(B) 单文件「目录结构清单（manifest）」。
> 同时提供 **manifest 生成器**，可把某台电脑的目录结构保存为单个清单文件，**无需在
> RemoteStorage 中真正建立所有文件夹**。文件内容读取/编辑、写回同步不在本期。

---

## 1. 背景与目标

FluentOS-On-Web 自带一套虚拟文件系统（VFS），持久化在 `localStorage` 的 `fluentos.fs`，
结构为 `{ root: { id, name, type:'folder'|'file', children:[...] } }`，文件管理器据此渲染
面包屑与内容列表。

本需求目标：在「文件」应用中，让用户能够读取 **某个 RemoteStorage 连接下保存的目录层级**，
并像浏览本地文件夹一样展示到文件管理器。除 RemoteStorage.js 自身的文件系统（形态 A）外，
**额外需要一种可以保存为 RemoteStorage 下单个文件的「目录结构清单」机制（形态 B）**：

- **(A) 实时文件夹层级**：读 RemoteStorage 中真实存在的文件夹（带尾斜杠的资源，listing 返回
  子目录）。反映「已存在的文件」。
- **(B) 目录结构清单（manifest）**：把整棵目录树序列化成一个 JSON 文件保存到 RemoteStorage。
  文件管理器读取**这一个文件**即可还原并显示目录树，**无需在 RemoteStorage 中真正建立这些
  文件夹**。这正好满足「生成一个跟某台电脑上一样的目录结构，而不需要把所有的目录都建立起来」。

两种数据源在文件管理器中并存，用户可分别浏览；本期均只读展示，仅目录。

---

## 2. 范围

### In scope（本期）
- RemoteStorage **连接配置**（多连接：name / href / token / basePath / manifestFile / enabled）。
- 文件管理器新增「Remote Storage」挂载节点，按连接展开，每个连接提供「实时目录」与「清单视图」入口。
- 数据源 (A)：懒加载并展示真实目录层级。
- 数据源 (B)：读取单个 manifest 文件并展示其目录树。
- **Manifest 生成器（Writer）**：把某台电脑的本地目录结构收集为单个清单 JSON，一次性写入
  RemoteStorage（只 1 次 PUT，不建任何真实子目录）。
- 面包屑、下钻/返回、加载态、错误态、重试、无网络/无配置降级；连接配置持久化。

### Out of scope（本期不做，留待后续）
- 远程文件内容预览/打开（记事本、媒体）。
- 上传 / 新建 / 重命名 / 删除远程文件或目录（写回 RemoteStorage）。
- 「清单 → 真实目录」物化（按需创建真实文件夹）。
- 双向同步、缓存持久化、OAuth 授权（本期用静态 Bearer token）。
- 与 zen-fs-sync / zen-fs-config「数据同步组」打通。

---

## 3. 现有架构分析

### 3.1 FluentOS VFS 数据模型（`js/core/storage.js` + `js/core/state.js`）
- `State.fs = { root: { id:'root', name:'此电脑', type:'folder', children:[...] } }`。
- 树节点：`{ id, name, type:'folder'|'file', children:[...], ... }`。
- 根节点默认子节点：`desktop / documents / pictures / music / downloads / recycle`。
- 文件系统变更统一走 `State.updateFS(State.fs)` 写回 `localStorage`，并 `emit('fsChange')`。
- 节点查找：`State.findNode(id, node=State.fs.root)` —— **仅在持久 FS 树内查找**。

### 3.2 文件管理器渲染与导航（`js/apps/files.js`）
- `renderFileList()`：渲染 `this.currentNode.children`；根节点子节点特殊排序（`recycle` 置底）。
- `navigateTo(node)`：直接接收节点对象引用，更新 `currentPath` / `currentNode` 并重渲染。
- `navigateToId(id)`：调用 `State.findNode(id)` 解析节点 —— **远程/清单节点不在持久树内，
  必须替换/扩展该解析逻辑**。
- `getPathToNode(id)`、`goBack()` / `goForward()`：同样依赖 `State.findNode`
  （`goBack/Forward` 用 `State.findNode(currentPath[last])` 还原 `currentNode`）。
- 无独立左侧树侧栏；导航靠面包屑 + 内容区。根节点的 `SYSTEM_ROOT_FOLDERS` 受保护。

### 3.3 RemoteStorage 数据结构（`zen-fs-remotestoragejs`）
- RemoteStorage 协议：文件夹是带尾斜杠的资源；`GET <folder>/` 返回 listing JSON：
  `{ "sub/": {"ETag":"..."}, "file.txt": {"ETag":"...","Content-Type":"...","Content-Length":N} }`；
  **键名以 `/` 结尾即目录**（形态 A 的数据来源）。
- `zen-fs-remotestoragejs` 封装 `RemoteStorageFileSystem`：`RemoteStorageConfig`
  （`href, token, basePath?, headers?, timeout?, ...`）、`readdir(path)` → `RemoteStorageEntry[]`、
  `stat(path)`、`writeFile(path, data, opts)`、`mkdir` 等。
- **关键约束**：该库是 TypeScript / npm 包，FluentOS-On-Web 是**纯 HTML/CSS/JS、无构建步骤**
  的工程，无法直接 import 其 TS 源码。本期读取侧采用「轻量直连客户端」直接请求
  RemoteStorage（listing / manifest 文件均可经 HTTP GET 取得），后续可选 vendor 为浏览器包。
  而 **manifest 生成器（Writer）运行在 Node 环境**，可直接使用 `zen-fs-remotestoragejs`。

---

## 4. 方案设计（文件管理器 · 读取侧）

### 4.1 连接配置存储（`fluentos.settings`）
新增（相对原设计增加 `manifestFile`）：

```js
settings.remoteStorage = {
  connections: [
    { id: 'c1', name: 'My RS', href: 'https://storage.example.com/',
      token: 'xxxx', basePath: '/public/', manifestFile: '/public/fs-manifest.json',
      enabled: true }
  ]
};
```
- 设置应用新增「Remote Storage」分组，可增 / 删 / 改连接。
- token 仅本地保存；`manifestFile` 指向形态 B 的清单文件（可为空表示不使用清单视图）。

### 4.2 挂载节点：运行时虚拟树（不写入持久 FS）
新增独立内存虚拟树 `FilesApp.remoteTree`：

```
remoteTree (运行时注入，非持久)
└─ remotestorage-root   { id:'remotestorage-root', type:'remotestorage-mount', children:[按连接] }
   └─ rs-<connId>       { id:'rs-<connId>', type:'remotestorage-conn',
       connectionId, basePath, manifestFile, children:[两个入口], _loading, _error }
       ├─ rs-<connId>-live   { type:'remotestorage-live', name:'实时目录', connectionId, path:basePath, children:[懒加载] }
       └─ rs-<connId>-manifest{ type:'remotestorage-manifest', name:'目录清单', connectionId, manifestFile, children:[来自清单] }
```

注入方式：渲染期把 `remotestorage-root` 作为 `State.fs.root.children` 的逻辑追加项
（仅渲染合并，**不调用 `State.updateFS`**）。`live` 入口对应形态 A，`manifest` 入口对应形态 B。

### 4.3 RemoteStorage 直连客户端（新增 `js/core/remotestorage-client.js`）
导出：

```js
// 形态 A：读取某目录下的子目录
listDirectories(cfg) → Promise<Array<{ name, path, isDirectory:true, etag? }>>
// 形态 B：读取清单文件并解析为树
fetchManifest(cfg)    → Promise<{ root:{ name, type:'folder', children:[] } }>
```

- `listDirectories`：`GET `${href}${path}``（path 以 `/` 结尾），头
  `Authorization: Bearer <token>`、`Accept: application/json`；解析 listing，筛键名以 `/` 结尾为目录。
- `fetchManifest`：`GET `${href}${manifestFile}``，解析 JSON，校验 `version/root`，返回 `root` 树。
- 错误归一化：`401/403`→`AuthError`；`404`→`NotFoundError`；网络/超时→`NetworkError`。

> 备选：后续用 vendored `zen-fs-remotestoragejs` 的 `readdir` / `readFile` 替换，对上层透明。

### 4.4 懒加载、缓存与刷新
- 进入远程目录节点时，若 `children` 为空或标记 `_stale`，调用相应客户端填充。
- 会话内内存缓存：`Map<connId+path, entries>`；「刷新」清缓存并重拉，置 `_stale`。
- 远程节点**不写入** `State.fs`，每次进入按需拉取（manifest 为单文件，整树一次取得）。

### 4.5 导航解析替换（关键改动）
`State.findNode` 仅查持久树，需引入 `FilesApp.resolveNode(id)`：

```js
resolveNode(id) {
  const local = State.findNode(id);
  if (local) return local;
  return findInRemoteTree(this.remoteTree, id);
}
```

并将 `navigateToId` / `goBack` / `goForward` / `getPathToNode` 中对 `State.findNode` 的调用
替换为 `resolveNode`。远程/清单节点 `currentPath` 用虚拟树路径记录，`goBack/Forward` 借
`resolveNode` 还原。

### 4.6 渲染适配与只读约束
- `renderFileList` 对 `type` 以 `remotestorage-` 开头的节点：显示图标 + 名称；加载中 spinner；
  错误提示 + 重试；**禁用**右键新建 / 重命名 / 删除 / 上传；目录双击下钻，文件（后续）提示「暂不支持」。
- `updateBreadcrumb` 支持远程/清单路径（`Remote Storage / <connName> / 实时目录 / <dir>` 或
  `… / 目录清单 / <dir>`）。
- 无连接配置 → 不注入挂载节点或显示「未配置 Remote Storage」。

### 4.7 错误处理与降级
- 无连接：隐藏挂载节点或显示占位。
- 401/403：鉴权错误 + 「编辑连接」入口。
- 网络失败：错误态 + 重试，不影响本地 FS。
- 只读：所有写操作禁用。

---

## 5. 目录结构清单（Manifest）系统（新增需求 · 写入侧）

### 5.1 动机与定位
RemoteStorage 的目录 = 资源。按形态 (A) 展示真实文件夹时，若要「复刻某台电脑的目录结构」，
需为每个文件夹发一次 PUT，目录深时成本高、且污染真实存储。形态 B 用**单个清单文件**描述整棵
目录树：生成时只写一次文件，读取时只解析一个文件，完全不创建真实子目录。它表达的是
「想要的 / 规划好的目录结构」，与 (A) 的「已存在的文件」互补。

### 5.2 Manifest 格式（草案）
```json
{
  "version": 1,
  "generatedAt": "2026-10-24T12:00:00.000Z",
  "generator": "fluentos-dir-struct-gen",
  "source": "C:\\Users\\vivia\\Projects",
  "root": {
    "name": "Projects",
    "type": "folder",
    "children": [
      { "name": "src", "type": "folder", "children": [
        { "name": "core", "type": "folder", "children": [] },
        { "name": "ui",   "type": "folder", "children": [] }
      ]},
      { "name": "README.md", "type": "file" }
    ]
  }
}
```
- 单根；路径由 `children` 嵌套表达，不依赖 RemoteStorage 真实路径。
- 本期仅目录（`type:'folder'` + `children`）；`file` 项可省略或仅占位。

### 5.3 生成器（Writer）—— 把「某台电脑的目录」变成清单并保存到 RemoteStorage
目标：生成一个跟某台电脑一样的目录结构，而不需要把所有的目录都建立起来。
已实现的路线为 **(W2) 本地 Web App**（见 `FluentOS-On-Web/dir-struct-gen/`），它直接读取用户本机
真实目录、让用户在树形界面勾选要包含的目录、生成 §5.2 的 manifest JSON，并支持下载或上传到
RemoteStorage。原始设计中设想的 (W1) Node 脚本作为可选替代仍可实现（用 `zen-fs-remotestoragejs`
的 `writeFile` 一次性写入），但 (W2) 已覆盖核心诉求且无需 Node 环境。

**已交付：本地 Web App `FluentOS-On-Web/dir-struct-gen/`**
- `index.html` / `styles.css` / `app.js` / `README.md`。
- 目录读取：优先 `window.showDirectoryPicker()`（File System Access API，Chromium）；
  兼容模式 `<input webkitdirectory>`（Firefox/Safari，空目录不显示）。
- 树形展示 + 勾选：级联勾选（父影响子、子聚合父的 indeterminate）、全选/全不选、展开/折叠。
- 实时生成 manifest JSON 预览，可下载 `fs-manifest.json` 或复制到剪贴板。
- 可选「保存到 RemoteStorage」：`PUT` 清单文件到 `href + basePath + manifestFile`
  （`Authorization: Bearer <token>`，`Content-Type: application/json`），仅 1 次请求，**不创建真实子目录**。
- 运行：需安全上下文，用 `python -m http.server` 起本地服务后访问 `http://localhost:8000/`。

> 与读取侧（§4.3 `fetchManifest`）共享同一 manifest 格式，文件管理器「目录清单」入口可直接消费本 App 产出。

### 5.4 读取器适配（Reader，复用 §4）
- 连接配置 `manifestFile` 非空时，挂载节点下出现「目录清单」入口（`remotestorage-manifest`）。
- `RemoteStorageClient.fetchManifest(cfg)`：GET 清单文件 → 解析 → 把 `root` 及其 `children`
  转换为 §4.2 的 `remotestorage-dir` 虚拟节点（含 `connectionId` / `path` 标记）。
- 渲染、面包屑、只读约束、缓存/刷新均复用 §4.4–§4.7；清单为单文件，一次取得整树。

### 5.5 后续可选：「清单 → 真实目录」物化
提供按需操作，把 manifest 的 `children` 递归 `mkdir` 到 RemoteStorage（用
`zen-fs-remotestoragejs` 目录创建接口），不在本期。

---

## 6. 数据模型与接口（草案）

### 6.1 设置数据结构
```js
settings.remoteStorage = {
  connections: [
    { id:'c1', name:'My RS', href:'https://storage.example.com/',
      token:'xxxx', basePath:'/public/', manifestFile:'/public/fs-manifest.json', enabled:true }
  ]
};
```

### 6.2 客户端接口
```js
listDirectories(cfg:{href,token,path,headers?})
  : Promise<Array<{ name:string, path:string, isDirectory:true, etag?:string }>>
fetchManifest(cfg:{href,token,manifestFile,headers?})
  : Promise<{ root:{ name:string, type:'folder', children:Array } }>
```

### 6.3 Manifest 格式（见 §5.2）
### 6.4 运行时虚拟节点（非持久，见 §4.2）
```js
{ id:string, name:string,
  type:'remotestorage-mount'|'remotestorage-conn'|'remotestorage-live'
      |'remotestorage-manifest'|'remotestorage-dir',
  connectionId?:string, path?:string, manifestFile?:string,
  children?:Array<object>, _loading?:boolean, _error?:Error|null, _stale?:boolean }
```

---

## 7. 改动清单

| 文件 | 改动 |
| --- | --- |
| `js/core/remotestorage-client.js` | **新增**：`listDirectories`（形态 A）+ `fetchManifest`（形态 B），错误归一化、会话缓存。 |
| `js/core/state.js` | 可选 `getRemoteStorageMount()`；或挂载逻辑全在 `files.js` 内。 |
| `js/apps/files.js` | 注入 `remotestorage-root`（含 live / manifest 两个入口）；新增 `remoteTree` 与
  `resolveNode`；`navigateToId/goBack/goForward/getPathToNode` 改用 `resolveNode`；
  `renderFileList` / `updateBreadcrumb` 对 `remotestorage-*` 适配（加载/错误/只读）；刷新重试。 |
| `js/apps/settings.js` | 新增「Remote Storage」连接管理 UI（含 `manifestFile` 字段）。 |
| `js/core/i18n.js` | 新增中英文本地化（Remote Storage、实时目录、目录清单、加载中、鉴权失败、未配置等）。 |
| `css/apps-unified.css` 或 files 内联 | 远程/清单节点、加载 spinner、错误态样式。 |
| `index.html` | 轻量客户端方案**无需**改动；若后续 vendor `zen-fs-remotestoragejs` 再追加 `<script>`。 |
| `scripts/gen-dir-struct.mjs`（或 `tools/`） | **新增（写入侧 W1）**：Node 脚本，遍历本地目录生成 manifest 并 `writeFile` 到 RemoteStorage。 |
| `js/apps/dir-struct-gen.js`（可选 W2） | **新增（可选）**：FluentOS 内置清单生成器应用。 |

> 改动运行时资源（`js/`、`css/`、`index.html`）后，按 README 顺序执行
> `generate-resource-manifest.ps1` → `generate-storage-manifest.ps1` → `validate-project.ps1`。

---

## 8. 验收标准

1. 配置一个 RemoteStorage 连接后，文件管理器根目录出现「Remote Storage」节点。
2. 「实时目录」入口可展示 `basePath` 下的真实目录（仅目录）。
3. 若配置了 `manifestFile`，「目录清单」入口可读取并展示该清单文件的目录树（无需真实文件夹存在）。
4. 子目录可继续下钻，面包屑与返回/前进历史正确。
5. **生成器（W1）**：对本地某目录运行脚本后，RemoteStorage 中仅新增 1 个 manifest 文件，
   且文件管理器能正确展示该目录树（验证「不需建立所有目录」）。
6. 网络/鉴权失败显示错误态并可重试，不影响本地 FS 浏览。
7. 远程/清单节点不可新建 / 重命名 / 删除 / 上传（只读约束生效）。
8. 浅 / 深主题、刷新后连接配置持久、无网络环境均正常。

---

## 9. 后续扩展（非本期）

- 文件内容读取与打开（记事本 / 媒体 / 图片预览）。
- 上传 / 新建 / 删除（写回 RemoteStorage）。
- 「清单 → 真实目录」物化：按 manifest 递归创建真实文件夹。
- 用 vendored `zen-fs-remotestoragejs` 替换直连客户端，统一 FS 语义与缓存。
- 与 zen-fs-sync / zen-fs-config「数据同步组」打通，实现双向同步。
