# 目录结构清单生成器（本地 Web App）

把本地真实目录树转化为 **RemoteStorage 目录结构清单（manifest）JSON**，无需在 RemoteStorage 中
真正建立所有文件夹。对应设计文档：`FluentOS-On-Web/remotestorage-fs-plan.md`（形态 B）。

## 功能
- 浏览本机真实磁盘：页面打开即显示「此电脑」根节点，下列出本机所有驱动器（C:、D: …）。
- 目录**逐层懒加载**：点开某层才向本地服务请求下一层（适合大目录，默认不选中，避免误把整块磁盘选入清单）。
- 勾选需要包含到清单中的目录（级联勾选 / 全选 / 全不选 / 展开折叠）。
- **含子目录（递归选择）**：目录行上的「⊕ 含子目录」按钮，可一次性将该目录**及其下全部子孙目录（含尚未在页面加载的层）**纳入清单——勾选后生成器会递归向后端抓取完整子树，无需逐层手动展开勾选。再次点击取消。
- **目录标签**：后端按目录内容**自动打标签**（如含 `.git` ⇒ `git`、含 `package.json` ⇒ `node`、含 `Cargo.toml` ⇒ `rust` 等，规则见 `serve.js` 的 `TAG_RULES`）；用户也可对任意目录**手动加/删标签**（点目录行的「+标签」）。
- 实时生成 manifest 预览（**v2 拆分**形式：主机索引 + 每块盘一个卷文件，与上传到 RemoteStorage 的文件一一对应）；可**复制单个文件 / 复制全部**，或**下载 ZIP**（解压后即为上传的那组文件）。
- **汇总文件数与大小**：勾选「汇总文件数与大小」后，清单里**每个被选中的目录节点**都会附带该目录（含其下所有子孙）的文件数量 `fileCount` 与总字节数 `totalSize`；同时若开启「包含文件」，单个文件叶子也会带 `size`（字节）。统计只针对**被选中的目录子树**递归扫描（后端 `GET /api/summary` 接收被选中的目录作为扫描根，绝不扫描整块盘），前端按目录路径缓存 2 分钟，日常勾选不会触发重扫。
- 可选：直接 **PUT 上传**到 RemoteStorage（填服务器地址、Token、基础路径、清单文件名）。

> 浏览由本地 Node 服务（`serve.js`）提供：`GET /api/drives` 列出磁盘，`GET /api/list?path=…`
> 列出某一层。因此**不需要浏览器文件选择器**，`localhost` 下 Chrome / Edge / Firefox / Safari 均可使用，
> 也彻底绕开了「跨源 iframe 禁文件选择器」「`file://` 不暴露 API」等坑。

## 输出格式
与文件管理器读取侧约定的 manifest 一致：
```json
{
  "version": 1,
  "generatedAt": "2026-10-24T12:00:00.000Z",
  "generator": "fluentos-dir-struct-gen",
  "source": "<computerId>",
  "root": { "name": "<computerId>", "type": "folder", "children": [ { "name": "C:", "type": "folder", "fileCount": 1280, "totalSize": 524288000, "children": [
    { "name": "Projects", "type": "folder", "tags": ["git", "node"], "fileCount": 42, "totalSize": 1234567, "children": [
      { "name": "README.md", "type": "file", "size": 2048 }
    ] }
  ] } ] }
}
```

> - `root.name` / `source` 取**本机 ID**（`os.hostname()`，由 `GET /api/drives` 的 `computerId` 字段返回），
>   这样多台电脑各自生成的清单互不混淆、可在文件管理器中按电脑区分挂载。
> - `tags` 为可选字段：自动标签（后端探测）与手动标签合并去重后写入，便于读取侧按标签筛选/展示；无标签时不出现该字段。
> - `fileCount` / `totalSize` 为可选字段（开启「汇总文件数与大小」后出现）：分别表示该目录（**含其下所有子孙目录**）中的文件总数与文件总字节数，便于读取侧快速展示「这个目录有多大、多少文件」而无需递归下钻。盘根与任意被选中的子目录都会带上；未开启或统计不可达（如无访问权限）时则该字段缺省。

## 预览与上传的格式（v2 拆分）

页面右侧预览、以及上传到 RemoteStorage 的内容采用**同一套 v2 拆分格式**，确保「所见即所传」：

- **主机索引** `<清单文件名>.json`（`version: 2`）：只记录本机挂了哪些盘、盘符、稳定身份（volumeId），不含目录树。
  ```json
  { "version": 2, "source": "<computerId>", "mounts": [
    { "letter": "C:", "volumeId": "A401-6B8F", "file": "A401-6B8F" },
    { "letter": "O:", "volumeId": null, "file": "HOST__O_" }
  ] }
  ```
- **卷文件** `<volumeKey>.json`（每块盘一个，含该盘的目录树）：`{ volumeId, name, type:"folder", children:[…], sources:[<computerId>] }`。多主机选了同一块盘时，`sources` 累加（卷级去重）。

预览区按上述文件逐个展示为独立窗口（主机索引标记为蓝色卡片），「下载 ZIP」会把它们打包成一组文件，解压后**与上传到 RS 的完全一致**。读取侧（FluentOS 文件管理器、onenav）再按 `mounts` 把主机索引与各卷文件拼回成上方的单一 v1 树。

> 说明：页面内部仍先生成逻辑上的 v1 单树（便于勾选/汇总计算），再由 `buildV2Payload` 拆成 v2；上传与预览共用同一拆分函数，避免两者不一致。
> - `size` 为可选字段（同时开启「包含文件」与「汇总文件数与大小」时出现于文件叶子）：该文件的字节数。

## 参数持久化（自动填入）
RemoteStorage 的服务器地址 / Token / 基础路径 / 清单文件名，以及「包含文件」「汇总文件数与大小」选项，会**自动保存到本地服务**（`PUT /api/settings`，落盘到 `app_data/folders/<主机名>.json`），刷新页面后**自动回填**，无需重填。
> ⚠️ 该文件含 Token 明文，已被 `dir-struct-gen/.gitignore` 排除，切勿提交。

**默认值**（首次打开、无已存参数时自动填入）：
- 基础路径 → `/app_data/folders/`
- 清单文件名 → 本机主机名（`GET /api/drives` 的 `computerId`），形如 `LAPTOP-91PR81Q2`
- 服务器地址 / Token → 空（需手动填写）；「包含文件」→ 关闭；「汇总文件数与大小」→ 开启

即上传目标默认为 `<服务器地址>/app_data/folders/<主机名>`。

## 加载已有清单并展开目录树
右侧预览区上方有：
- **加载本地 JSON**：选一个本地 manifest 文件，自动按其中目录**逐级展开本机磁盘树**并**勾选**对应目录（未匹配到的盘符/路径会被跳过）。
- **从 RS 加载**：用上方填写的 RemoteStorage 参数 `GET` 取回清单（带 `Bearer` Token），再做同样的展开勾选。

这样可在不同电脑/时间段之间复用同一份目录选择。

## 运行
必须用本目录的 Node 服务（它同时提供静态页面与磁盘浏览 API），不要直接双击 `file://` 打开：

```powershell
# 在本目录（dir-struct-gen）下，双击 start.bat，或手动：
node serve.js
# 浏览器访问 http://localhost:8000/
```

任何现代浏览器均可（Chrome / Edge / Firefox / Safari），点开「此电脑」下的盘符即可逐层浏览。
