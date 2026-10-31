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
  - 必有（本次新增）：`updatedAt`——该节点**最后一次被扫描确认存在**的时间，毫秒级 Unix epoch（UTC，如 `1793351520000`），供多分片合并时「按时间取新」。文件占位节点（开启「包含文件」时）同样携带。
  - 条件：驱动节点带 `volumeId`；有标签带 `tags`；磁盘确实无子目录带 `leaf: true`。
- 顶层结构：`{ version:1, generatedAt, generator:'fluentos-dir-struct-gen', source:主机名, root:{...} }`（`generatedAt` 保持 ISO 8601 字符串不变）。

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
2. `GET` 列出 `base` 目录，把同一卷已有分片（含旧版单文件 `<volumeKey>.json`）收进本机已知分片索引，供主机索引的 `mounts.files` 列全。
3. 生成清单。
4. 逐块盘上传**本机自己的分片**：文件名 `<volumeKey>.<partId>.json`（`volumeKey` 取 `volumeId`，取不到回退 `主机::盘符`，均经脱敏；`partId` 默认本机 ID），内容含 `volumeId`、`part:{id,revision,generatedAt}`、目录子树、`sources:[主机名]`。**只写自己的分片，不再读改写别人的文件**——多台主机同时上传不会互相覆盖。
5. 上传**主机索引**：`{ version:2, source, generatedAt, generator, mounts:[{letter, volumeId, file, files}] }`，文件名即清单文件名（默认 `app_data/folders/<主机名>.json`）。`file` 为主文件基名（优先旧版单文件，否则字典序第一份分片），`files` 为该卷全部分片 `[{file, partId}]`。
6. 上传成功后落盘分片版本号（下次生成时 +1）并持久化已知分片索引。

**从 RS 加载**（`loadRemoteJSON`）：
1. 读取主机索引清单（`base` + 清单文件名）。
2. 对每个 `mounts` 项取该卷全部分片（优先 `files`，缺失回退 `file`），**按 volumeId 合并**成一棵树（规则见 5.6）后再 `applyManifest` 展开并勾选。
3. 读取 folder_deepen 深挖标记（**保留、不清空**），下钻展示其中的目录并打「深挖」徽章。
4. 状态栏显示「已按 folder_deepen 下钻 N 个目录（标记保留）」；未读到则提示，未匹配路径列出前 6 条。

**folder_deepen 深挖标记**：
- 独立 category，固定位于 `<用户>/app_data/folder-deepen/<盘key>.json`（**不在 `folders/` 下**）。
- 内容：`{ marks: ["C:/codes/android", "C:/codes/stock-server", ...] }`（host-relative 路径）。
- 功能：外部工具/侧把「需要下钻展示的目录」写到这里；本程序读取后沿路径逐层加载，使这些目录出现在树中并带「深挖」徽章，便于浏览深层目录。支持嵌套（标记目录的子目录也被标记时最多迭代 5 轮）。
- 上传时消费（清空）；从 RS 加载时保留（不清空，供后续消费）。

### 4.10 参数持久化

- RemoteStorage 参数、「包含文件」「汇总文件数与大小」开关，以及**已知分片索引**（`shardIndex`：卷索引键 → 分片基名数组）在变更时自动 `PUT /api/settings` 保存到本机服务（文件名即主机名）。
- 页面加载时 `GET /api/settings` 自动回填。
- 默认值：`base=/app_data/folders/`、清单文件名=主机名。
- 分片版本号（`part.revision`）单独存浏览器 `localStorage`（`dirStructGen.partRevisions`），随机器走、不写进服务端设置。

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

### 5.2 卷文件（每卷可有多份分片）

位置：`<base>/<盘key脱敏>.<partId>.json`，如 `app_data/folders/3664f754-44a1-4811-aa03-94bc529192ee.LAPTOP-91PR81Q2.json`；
旧版单文件为 `<base>/<盘key脱敏>.json`（无 `part`，结构相同，仍会被一并合并读取，无需手工迁移）。

结构：`{ volumeId, name, type:'folder', part:{ id, revision, generatedAt }, children, sources:[主机名] }`。

- 盘 key 规则：优先用 `<盘根>/.dir-struct-id` 的 `volumeId`；取不到时回退 `<主机名>::<盘符>` 经脱敏（`:` → `_`），如 `LAPTOP-91PR81Q2::C:` → `LAPTOP-91PR81Q2__C_`。
- `partId`：分片身份，默认本机 ID（主机名，脱敏后）。**同一块盘因此可以有多份目录结构文件**，每台主机一份、互不覆盖。
- `part.revision`：该分片自增版本号（本机 `localStorage` 记录，每次成功上传 +1），预览里显示的是「下次上传将写入的版本号」；
  `part.generatedAt`：毫秒级 Unix epoch 的生成时间（与节点 `updatedAt` 同一口径，便于合并比较）。
- 上传只写自己的分片，**不再在别人的文件上「读 → 合并 → 写回」**。

### 5.3 主机索引

位置：`<base>/<清单文件名>.json`，默认 `app_data/folders/<主机名>.json`。
结构：`{ version:2, source, generatedAt, generator, mounts:[{letter, volumeId, file, files}] }`。

- `file`：主文件基名（不含 `.json`）——优先旧版单文件 `<volumeKey>`，否则取该卷分片里字典序第一份；供尚未支持 `files` 的读取侧兜底。
- `files`：该卷**全部分片** `[{ file, partId }]`（`partId` 为 `null` 表示旧版单文件）；上传前由 `GET` 列出 `base` 目录、按 `<volumeKey>.` 前缀收集同卷分片。

### 5.4 folder_deepen 深挖标记

位置：`<用户>/app_data/folder-deepen/<盘key>.json`。
结构：`{ marks: ["C:/codes/android", ...] }`。

### 5.5 leaf 底部节点标记

- 生成侧：磁盘上确实无子目录的目录写入 `"leaf": true`。
- 读取侧（混合策略）：`leaf:true` 时**先回退校验磁盘一次**——磁盘确实为空才标为底部节点（无展开按钮、勾选整目录、不下钻）；若磁盘已有子目录（清单过时）则不信任，保留展开按钮、按常规处理。

### 5.6 分片合并规则（同一卷多份文件合成一棵树）

把同一 `volumeId` 的全部分片（含旧版单文件）合并成一棵树时按下列规则执行，**幂等且结果确定**：

1. `children`：**并集**（递归合并同名子节点）——某台机没扫到不代表目录不存在，绝不因「另一份更新」而删掉别人的目录。
2. 同名节点属性：按**最后确认时间取较新**——节点 `updatedAt` 优先，缺失则回退 `part.generatedAt` / 顶层 `generatedAt`。
3. `tags` / `sources`：**并集去重**（累积信息，不被时间覆盖）。
4. `leaf`：**重算**——合并后有子目录即去掉 `leaf`（否则读取侧不显示展开按钮，会把深挖出的层藏住）；两侧都没见过子目录才算底部。
5. 同名类型冲突（`folder` vs `file`）：**folder 优先**，不看时间（`file` 只是占位、不读内容）。
6. 时间缺失、或两侧时间差不超过 **5 分钟**（`MERGE_TIME_TOLERANCE_MS`，多机时钟未必同步）→ 按 `part.id` 字典序取大者兜底，保证同一组输入永远得到同一棵树（便于 diff / 缓存）。
7. `volumeId`：驱动层身份字段，两侧谁有取谁，不会凭空补 `null`（否则破坏幂等）。

补充：
- `children` 合并后按「目录优先 + 名称数字感知」确定性排序（与树形视图同一口径）。
- 时间戳口径：节点 `updatedAt` 为**毫秒级 Unix epoch 数字**（如 `1793351520000`），读取侧同时兼容早先写入的 ISO 字符串（数字直接采信、字符串按 ISO 解析）；epoch 只统一了表示，**不能修正各机时钟误差**，故仍需第 6 条的容差与 `part.id` 兜底。
- 合并结果用于读取/展示，不写回成「一份合并文件」；需要归档时另行处理，且写回时不要保留多分片归并出来的 `part`。

---

## 6. 非功能需求

- **零依赖**：无需 `npm install`，Node 内置模块即可运行。
- **本地隔离**：仅监听 localhost，不暴露公网。
- **懒加载**：目录按需读取，避免一次加载整盘。
- **容错**：无权限目录标记锁节点不崩溃；标签探测失败不阻断；RemoteStorage 失败不阻塞本地操作；参数保存失败不阻断。
- **跨平台**：盘符列取/根归一化/卷身份兼容 Windows、macOS、Linux。
- **跨主机合并**：同一块盘可由多份分片描述（默认每台主机一份），靠 `volumeId` 归组，按 5.6 规则合并；各主机只写自己的分片，**不会互相覆盖**，多台电脑对同一块盘的选择可累加。

---

## 7. 关键设计决策与当前行为说明

1. **勾选只作用到当前可见层**：勾选目录只勾当前目录 + 当前展开可见的子节点（`propagateDown` 对折叠目录跳过，即使子目录数据已加载）；展开已勾选目录时新子项缺省不选。避免「勾一个目录意外全选整棵子树」。
2. **底部节点 `_leaf` 由磁盘实况决定**：仅磁盘确实无子目录才算；清单没保存下一层 ≠ 磁盘无子目录（保留展开按钮、缺省不展开）。
3. **`_leaf` 写入清单 + 读取时混合校验**：既保存生成时刻实况，又避免旧清单误判（磁盘变了以实况为准），代价是读取 leaf 目录时多发一次磁盘校验。
4. **folder_deepen 是独立 category**：位于 `/app_data/folder-deepen/`，不在 `folders/` 下，避免与清单/卷文件混放。
5. **卷身份优先于盘符**：用 `.dir-struct-id` 的 UUID 标识盘，跨主机/跨协议稳定；取不到时回退「主机+盘符」。
6. **懒加载继承勾选**：新展开的子项继承父节点勾选态，保证级联一致。
7. **一块盘可分多份分片，上传不再读改写**：每台主机写自己的 `<volumeKey>.<partId>.json`，避免旧实现「读别人的文件 → 合并 → 写回同一文件」在多机并发上传时丢更新；完整目录树改由读取侧按 `volumeId` 合并得到（规则见 5.6）。分片文件名不参与合并判定，因此改名不会断链。
8. **合并口径「children 并集 + 属性按时间取新」**：children 永远并集（不因另一份更新而删掉别人的目录），只有节点属性按 `updatedAt`（毫秒 epoch）取新；时间不可比较时按 `part.id` 字典序兜底，保证结果幂等、确定、可 diff。
9. **时间戳口径统一**：新增时间字段一律毫秒级 Unix epoch 数字（UTC），顶层 `generatedAt` 保持 ISO 字符串不变；读取侧需同时兼容旧的 ISO 字符串写法。
