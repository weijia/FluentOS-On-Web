# Dir Struct Generator（目录结构清单生成器）需求文档

> 面向项目：`C:\codes\nodejs\FluentOS-On-Web\dir-struct-gen\`
> 组成：`serve.js`（零依赖 Node 本地服务）、`app.js`（前端逻辑）、`index.html`（页面）、`styles.css`（样式）、`start.bat`（启动脚本）

---

## 1. 项目概述

一个**本地 Web 应用**，让用户在浏览器里逐层浏览本机磁盘目录树，勾选想要纳入备份/同步的目录，生成一份 **RemoteStorage 兼容的清单 JSON**（`fs-manifest`），并支持上传到 RemoteStorage、或从 RemoteStorage 加载恢复勾选。

核心特点：

- **后端本地服务读真实文件系统**：由 `serve.js` 在本机 `http://localhost:8000` 提供目录列表 API，浏览器端无需文件选择器，Chrome/Firefox/Safari 均可。
- **零第三方依赖**：纯 Node 内置模块（`http`、`fs`、`path`、`os`、`crypto`、`child_process`）+ 原生前端 JS，无 npm 依赖。
- **只监听 localhost**：仅本机可访问，用于读取本机磁盘与持久化 UI 参数。

---

## 2. 运行方式

- 双击 `start.bat` 启动（已处理 `fnm` 多 Node 版本环境注入）。
- 或命令行：在项目目录执行 `node serve.js`。
- 启动后浏览器打开 `http://localhost:8000/`。

---

## 3. 核心用户流程

```
启动 → 列出本机磁盘（此电脑 → 各盘符）
  → 点开盘符/目录逐层懒加载
  → 勾选要包含的目录（勾选含级联，见 4.3）
  → （可选）对目录手动打标签
  → 右侧实时预览生成清单 JSON
  → 复制 / 下载 / 上传到 RemoteStorage
  → 下次可从 RemoteStorage 加载恢复勾选，或按 folder_deepen 深挖标记下钻展示
```

---

## 4. 功能需求

### 4.1 后端本地服务（serve.js）

| API | 方法 | 说明 |
|---|---|---|
| `/api/drives` | GET | 返回 `{ computerId, drives: [{letter, root, volumeId}] }`。列本机盘符（Windows 用 PowerShell `Get-PSDrive`，失败回退探测 A–Z）。`computerId` 默认主机名，用于区分多台电脑生成的清单。 |
| `/api/list?path=<dir>` | GET | 返回 `{ path, items: [{name, kind: 'dir'\|'file', tags?}] }`。读目录直接子项，目录优先排序（数值感知）。读失败返回 404，前端标记为不可访问节点。 |
| `/api/settings` | GET/PUT | 持久化 UI 参数（RemoteStorage href/token/base/file、是否包含文件），文件名即主机名，存于 `app_data/folders/<主机名>.json`。 |
| 静态文件 | GET | 服务 `index.html`/`styles.css`/`app.js` 等；路径穿越防护（仅限项目目录内）。 |

其他后端细节：

- **盘符根归一化**：Windows 盘符根（`C:`/`C:\`）必须保留尾部反斜杠为 `C:\`（`C:` 在 Windows 表示当前工作目录而非根）。POSIX 根 `/` 同样保留。
- **卷稳定身份 `volumeId`**：首次见到某盘时在其根目录写 `.dir-struct-id`（UUID，Windows 加隐藏属性），之后跨系统/跨协议读回同一串字节，避免同一块盘在不同主机被当成不同盘。
- **自动标签探测**：仅对真实目录读取其「直接子项名」，按规则打标签（见 4.5）；无权限则不标签，不阻断列出。
- 过滤 `.dir-struct-id` 标记文件，避免污染目录树与清单。

### 4.2 磁盘浏览与懒加载

- 树根为虚拟「此电脑」节点（`name` 用主机名），始终勾选、不可取消。
- 下一层为各盘符节点（名称、根路径、`volumeId`）。
- **懒加载**：目录默认不加载子项；点开（`onTwisty`）才向 `/api/list` 请求下一层，未加载显示 `▸`。
- 加载成功后：新子项**继承父节点当前勾选态**；若子项为空则标记 `_leaf`（底部节点）。
- 加载失败（无权限等）：标记 `_error` 为不可展开的锁节点，不报红、不重试，仍可勾选（勾选后作为空文件夹进清单）。

### 4.3 勾选与级联（当前行为）

- 每个目录有勾选态：`checked`（全选）、`indeterminate`（半选，部分子项选中）。
- **勾选目录时，联动「当前展开可见」的所有直接子目录/文件**；若某直接子目录自身也未折叠，则继续递归联动其更深的后代（`propagateDown`）。
- **折叠的目录只勾当前目录本身**，不联动任何子目录——即使其子目录数据已加载到前端（`_loaded`），只要当前处于折叠（`_collapsed`）状态、子目录未显示，就不联动。
- **展开一个已勾选的目录时，新加载的子目录缺省不选中**（不继承父节点勾选态，需单独勾选）。
- 向上反算父节点（`recomputeUp`）：子项全选 → 父全选；部分 → 父半选；全不选 → 父不选。
- 语义：勾选只作用到「当前可见层」——展开可见的子目录随父联动，折叠或未加载的后代需展开后单独勾选。
- 全选/全不选按钮：对整棵树（或除根外）统一设勾选。

### 4.4 目录树渲染与节点状态

- 节点行：展开箭头（`▸`/`▾`/空）、复选框、目录名、目录项计数、标签、手动标签按钮。
- **展开箭头逻辑**：
  - 加载失败（`_error`）→ 无箭头（不可展开）。
  - 底部节点（`_leaf`，磁盘确实无子目录）→ 无箭头。
  - 未加载 → `▸`（点开展开）。
  - 已加载且有子项 → `▸`（折叠）/ `▾`（展开）。
  - 已加载且空目录 → 无箭头。
- **底部节点 `_leaf`**：仅当磁盘上确实无子目录（加载后 `children` 为空）时置 `true`，渲染时不显示展开按钮。
- **深挖徽章**：`_deepened` 目录（来自 folder_deepen，见 4.9）在标签区显示「深挖」徽章。
- 目录项计数：文件夹显示 `📁 N`（N 为已加载的直接子项数）。

### 4.5 标签系统

- **自动标签**（后端探测，基于目录直接子项名）：
  `git`、`node_modules`、`node`、`npm`、`yarn`、`pnpm`、`rust`、`python`、`venv`、`svn`、`hg`、`idea`、`vscode`、`docker`、`go`、`ruby`、`maven`、`gradle`、`make`、`cmake`。
  示例：含 `.git` ⇒ `git`；含 `package.json` ⇒ `node`；含 `node_modules` ⇒ `node_modules`。
- **手动标签**：用户可对单个目录追加标签（`manualTags`）。
- 自动 + 手动标签在生成清单时去重合并，写入节点的 `tags` 字段，供读取侧按标签筛选/展示。

### 4.6 清单生成

- `generateManifest()` 从当前勾选的树生成清单（`buildManifest` 递归）。
- 包含规则：
  - 目录：勾选（`checked`）或半选（`indeterminate`）的子目录才纳入并继续下钻；根始终纳入。
  - 文件：仅当「包含文件」开启时，勾选的文件以 `{name, type:'file'}` 占位纳入（不读内容）。
- 节点序列化字段：
  - 必有：`name`、`type: 'folder'`、`children`。
  - 条件：驱动节点带 `volumeId`；有标签带 `tags`；磁盘确实无子目录带 `leaf: true`。
- 顶层结构：`{ version:1, generatedAt, generator:'fluentos-dir-struct-gen', source:主机名, root:{...} }`。

### 4.7 清单操作

- **预览**：右侧 textarea 实时显示格式化 JSON。
- **复制**：把 JSON 复制到剪贴板。
- **下载**：下载为 `fs-manifest.json`。
- **重新生成**：按当前勾选重新生成并刷新预览。
- **「包含文件」开关**：切换后重新渲染树并重新生成。

### 4.8 本地加载 JSON

- 选择本地 `.json` 文件 → 解析 → `applyManifest` 应用到当前磁盘树（按驱动器名匹配，展开对应目录并勾选）。
- 应用后重新生成预览（保留原 JSON 的 `generatedAt`）。

### 4.9 RemoteStorage 集成

RemoteStorage 配置（href/token/base/file）位于页面底部折叠面板，参数自动持久化（见 4.10）。

**上传到 RemoteStorage**（`uploadToRS`）：
1. 应用 folder_deepen 深挖标记（按需多读磁盘层），并**清空**这些标记（消费）。
2. 生成清单。
3. 上传**主机索引**：`{ version:2, source, generatedAt, generator, mounts:[{letter, volumeId, file}] }`，文件名即清单文件名（默认 `app_data/folders/<主机名>.json`）。
4. 逐块盘上传**独立卷文件**：文件名为盘 key（主机名::盘符 → 脱敏），内容含 `volumeId`、目录子树、`sources:[主机名]`。与远端已有同盘卷文件**按 name 并集合并**（多主机对同一盘的选择累加）。
5. 上传时消费深挖标记（清空 `{marks:[]}` 写回）。

**从 RS 加载**（`loadRemoteJSON`）：
1. 读取主机索引清单（`base` + 清单文件名）。
2. `applyManifest` 展开并勾选。
3. 读取 folder_deepen 深挖标记（**保留、不清空**），下钻展示其中的目录并打「深挖」徽章。
4. 状态栏显示「已按 folder_deepen 下钻 N 个目录（标记保留）」；未读到则提示，未匹配路径列出前 6 条。

**folder_deepen 深挖标记**：
- 独立 category，固定位于 `<用户>/app_data/folder-deepen/<盘key>.json`（**不在 `folders/` 下**）。
- 内容：`{ marks: ["C:/codes/android", "C:/codes/stock-server", ...] }`（host-relative 路径）。
- 功能：外部工具/侧把「需要下钻展示的目录」写到这里；本程序读取后沿路径逐层加载，使这些目录出现在树中并带「深挖」徽章，便于浏览深层目录。支持嵌套（标记目录的子目录也被标记时最多迭代 5 轮）。
- 上传时消费（清空）；从 RS 加载时保留（不清空，供后续消费）。

### 4.10 参数持久化

- RemoteStorage 参数与「包含文件」开关在变更时自动 `PUT /api/settings` 保存到本机服务（文件名即主机名）。
- 页面加载时 `GET /api/settings` 自动回填。
- 默认值：`base=/app_data/folders/`、清单文件名=主机名。

---

## 5. 数据模型

### 5.1 清单 manifest

```json
{
  "version": 1,
  "generatedAt": "2026-10-29T00:00:00.000Z",
  "generator": "fluentos-dir-struct-gen",
  "source": "LAPTOP-91PR81Q2",
  "root": {
    "name": "LAPTOP-91PR81Q2",
    "type": "folder",
    "children": [
      {
        "name": "C:",
        "type": "folder",
        "volumeId": "3664f754-44a1-4811-aa03-94bc529192ee",
        "children": [
          {
            "name": "codes",
            "type": "folder",
            "tags": ["git"],
            "children": [
              { "name": "android", "type": "folder", "children": [] },
              { "name": "空目录", "type": "folder", "leaf": true, "children": [] }
            ]
          }
        ]
      }
    ]
  }
}
```

### 5.2 卷文件（每盘一个）

位置：`<base>/<盘key脱敏>.json`，如 `app_data/folders/LAPTOP-91PR81Q2__C_.json`。
结构：`{ volumeId, name, type:'folder', children, sources:[主机名...] }`。

盘 key 规则：`<主机名>::<盘符>` 经脱敏（`:` → `_`），如 `LAPTOP-91PR81Q2::C:` → `LAPTOP-91PR81Q2__C_`。

### 5.3 主机索引

位置：`<base>/<清单文件名>.json`，默认 `app_data/folders/<主机名>.json`。
结构：`{ version:2, source, generatedAt, generator, mounts:[{letter, volumeId, file}] }`。

### 5.4 folder_deepen 深挖标记

位置：`<用户>/app_data/folder-deepen/<盘key>.json`。
结构：`{ marks: ["C:/codes/android", ...] }`。

### 5.5 leaf 底部节点标记

- 生成侧：磁盘上确实无子目录的目录写入 `"leaf": true`。
- 读取侧（混合策略）：`leaf:true` 时**先回退校验磁盘一次**——磁盘确实为空才标为底部节点（无展开按钮、勾选整目录、不下钻）；若磁盘已有子目录（清单过时）则不信任，保留展开按钮、按常规处理。

---

## 6. 非功能需求

- **零依赖**：无需 `npm install`，Node 内置模块即可运行。
- **本地隔离**：仅监听 localhost，不暴露公网。
- **懒加载**：目录按需读取，避免一次加载整盘。
- **容错**：无权限目录标记锁节点不崩溃；标签探测失败不阻断；RemoteStorage 失败不阻塞本地操作；参数保存失败不阻断。
- **跨平台**：盘符列取/根归一化/卷身份兼容 Windows、macOS、Linux。
- **跨主机去重**：靠 volumeId + sources 并集合并，多台电脑对同一块盘的选择可累加。

---

## 7. 关键设计决策与当前行为说明

1. **勾选只作用到当前可见层**：勾选目录只勾当前目录 + 当前展开可见的子节点（`propagateDown` 对折叠目录跳过，即使子目录数据已加载）；展开已勾选目录时新子项缺省不选。避免「勾一个目录意外全选整棵子树」。
2. **底部节点 `_leaf` 由磁盘实况决定**：仅磁盘确实无子目录才算；清单没保存下一层 ≠ 磁盘无子目录（保留展开按钮、缺省不展开）。
3. **`_leaf` 写入清单 + 读取时混合校验**：既保存生成时刻实况，又避免旧清单误判（磁盘变了以实况为准），代价是读取 leaf 目录时多发一次磁盘校验。
4. **folder_deepen 是独立 category**：位于 `/app_data/folder-deepen/`，不在 `folders/` 下，避免与清单/卷文件混放。
5. **卷身份优先于盘符**：用 `.dir-struct-id` 的 UUID 标识盘，跨主机/跨协议稳定；取不到时回退「主机+盘符」。
6. **懒加载继承勾选**：新展开的子项继承父节点勾选态，保证级联一致。
