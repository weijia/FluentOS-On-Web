# 目录结构清单生成器（本地 Web App）

把本地真实目录树转化为 **RemoteStorage 目录结构清单（manifest）JSON**，无需在 RemoteStorage 中
真正建立所有文件夹。对应设计文档：`FluentOS-On-Web/remotestorage-fs-plan.md`（形态 B）。

## 功能
- 浏览本机真实磁盘：页面打开即显示「此电脑」根节点，下列出本机所有驱动器（C:、D: …）。
- 目录**逐层懒加载**：点开某层才向本地服务请求下一层（适合大目录，默认不选中，避免误把整块磁盘选入清单）。
- 勾选需要包含到清单中的目录（级联勾选 / 全选 / 全不选 / 展开折叠）。
- **含子目录（递归选择）**：目录行上的「⊕ 含子目录」按钮，可一次性将该目录**及其下全部子孙目录（含尚未在页面加载的层）**纳入清单——勾选后生成器会递归向后端抓取完整子树，无需逐层手动展开勾选。再次点击取消。
- **目录标签**：后端按目录内容**自动打标签**（如含 `.git` ⇒ `git`、含 `package.json` ⇒ `node`、含 `Cargo.toml` ⇒ `rust` 等，规则见 `serve.js` 的 `TAG_RULES`）；用户也可对任意目录**手动加/删标签**（点目录行的「+标签」）。
- 实时生成 manifest 预览（**v2 拆分**形式：主机索引 + 每块盘一份**分片**——默认每台主机一份，可分多份、由读取侧合并，与上传到 RemoteStorage 的文件一一对应）；可**复制单个文件 / 复制全部**，或**下载 ZIP**（解压后即为上传的那组文件）。
- **汇总文件数与大小**：勾选后，清单里**每个目录节点**（含半选目录）都会附带该目录**整棵物理子树**的两个数值：文件数量 `fileCount`、文件**逻辑大小**之和 `totalSize`、文件**占用磁盘空间**之和 `totalSizeOnDisk`（字节）；开启「包含文件」时单个文件叶子另带 `size`（逻辑大小）与 `sizeOnDisk`（占用磁盘空间）。
  - **占用取不到就用逻辑大小替代**：POSIX 由 `stat` 的 `st_blocks` × 512 取得占用；Windows 等拿不到该值的场合按替代规则处理，保证两个数值始终可用。
  - **与是否被单独勾选 / 显示无关**：没被单独勾选、也没出现在清单里的子目录与文件，其体积一样计入父目录——所以父目录的数值常常大于它可见子项之和，这是口径如此。
  - 扫描根取「会进清单的目录（勾选或半选）的最小独立子集」：半选目录也会被完整扫一次，才拿得到覆盖整棵子树的值；结果按路径缓存（本会话内不自动过期，只有「重新生成」或目录行的「↻」才会重扫）。
  - **绝不把读不到记成 0**：子树里有读不到（权限不足 / 目录读取超时）或超出递归深度上限的部分时，数值只写已统计到的部分并置 `sizePartial: true`（下界标记）。
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
  "root": { "name": "<computerId>", "type": "folder", "children": [ { "name": "C:", "type": "folder", "fileCount": 1280, "totalSize": 524288000, "totalSizeOnDisk": 536870912, "children": [
    { "name": "Projects", "type": "folder", "tags": ["git", "node"], "fileCount": 42, "totalSize": 1234567, "totalSizeOnDisk": 1236992, "children": [
      { "name": "README.md", "type": "file", "size": 2048, "sizeOnDisk": 4096 }
    ] }
  ] } ] }
}
```

> - `root.name` / `source` 取**本机 ID**（`os.hostname()`，由 `GET /api/drives` 的 `computerId` 字段返回），
>   这样多台电脑各自生成的清单互不混淆、可在文件管理器中按电脑区分挂载。
> - `tags` 为可选字段：自动标签（后端探测）与手动标签合并去重后写入，便于读取侧按标签筛选/展示；无标签时不出现该字段。
> - `fileCount` / `totalSize` / `totalSizeOnDisk` 为可选字段（开启「汇总文件数与大小」后出现）：分别表示该目录**整棵物理子树**中的文件总数、文件**逻辑大小**之和、文件**占用磁盘空间**之和，便于读取侧快速展示「这个目录有多大、多少文件」而无需递归下钻。**凡进入清单的目录都会带上**（含半选目录）；数值**不随子项是否被单独勾选 / 展示而变**，因此常常大于它在清单里的可见子项之和。子树里有读不到或超出深度上限的部分时，另带 `sizePartial: true`（下界标记）。未开启开关时这几个字段缺省。
> - 文件叶子（`type:"file"`）同样给两个数值：`size`（该文件的逻辑大小）与 `sizeOnDisk`（该文件的占用磁盘空间）。**取不到「占用」时按其逻辑大小替代**（POSIX 由 `st_blocks` × 512 取得占用；Windows 下 Node 不提供该字段，那里 `sizeOnDisk` 会等于 `size`）；两个数值都取不到时字段缺省，不写假 0。

## 预览与上传的格式（v2 拆分）

页面右侧预览、以及上传到 RemoteStorage 的内容采用**同一套 v2 拆分格式**，确保「所见即所传」：

- **主机索引** `<清单文件名>.json`（`version: 2`）：只记录本机挂了哪些盘、盘符、稳定身份（volumeId），以及该卷已知的**全部分片**，不含目录树。
  ```json
  { "version": 2, "source": "<computerId>", "mounts": [
    { "letter": "C:", "volumeId": "A401-6B8F", "file": "A401-6B8F",
      "files": [ { "file": "A401-6B8F.LAPTOP-A", "partId": "LAPTOP-A" },
                 { "file": "A401-6B8F.LAPTOP-B", "partId": "LAPTOP-B" } ] },
    { "letter": "O:", "volumeId": null, "file": "HOST__O_.HOST", "files": [ { "file": "HOST__O_.HOST", "partId": "HOST" } ] }
  ] }
  ```
- **卷文件分片** `<volumeKey>.<partId>.json`（**每台主机一份**，含该盘在本机勾选出的目录树）：
  `{ volumeId, name, type:"folder", part:{ id, revision, generatedAt }, children:[…], sources:[<computerId>] }`。
  - `partId` 默认本机 ID（主机名，安全化后）；`part.revision` 每次成功上传 +1（本机记录）；`part.generatedAt` 为毫秒级 epoch。
  - 同一块盘因此可以有多份文件：每台主机写自己的一份、**互不覆盖**；上传只 `PUT` 自己的分片，不再「读别人的文件 → 合并 → 写回同一文件」，多机同时上传也不会丢更新。
  - 早期版本写入的单文件 `<volumeKey>.json` 仍被识别，会与各分片一起被读取侧合并，无需手工迁移。
- `mounts[].file` = 主文件（不含 `.json` 的基名）：优先旧版单文件，否则取该卷分片里字典序第一份——供尚未支持 `files` 的读取侧兜底。

预览区按上述文件逐个展示为独立窗口（主机索引标记为蓝色卡片，卷文件卡片标题带 `partId`），「下载 ZIP」会把它们打包成一组文件，解压后**与上传到 RS 的完全一致**。

**读取侧合并规则**（同一 `volumeId` 的多份文件合成一棵树，幂等且结果确定）：

1. `children` 取**并集**——某台机没扫到不代表目录不存在，绝不因另一份「更新」而删掉别人的目录；
2. 同名节点属性按**最后确认时间取新**：节点 `updatedAt` 优先，缺失则回退 `part.generatedAt` / `generatedAt`；
3. `tags` / `sources` 取**并集去重**；
4. `leaf` **重算**：合并后有子目录就不再是底部节点；
5. 同名 `folder` / `file` 冲突：**folder 优先**，不看时间；
6. 时间缺失或相差不超过 **5 分钟**（多机时钟未必同步）→ 按 `part.id` 字典序兜底。

> 说明：页面内部仍先生成逻辑上的 v1 单树（便于勾选/汇总计算），再由 `buildV2Payload` 拆成 v2；上传与预览共用同一拆分函数，避免两者不一致。
> - 每个节点带 `updatedAt`（**毫秒级 Unix epoch**，UTC；语义为「最后一次被扫描确认存在的时间」）：多分片合并时按它取新。旧文件里的 ISO 字符串写法读取侧同样兼容解析。
> - `size` 为可选字段（同时开启「包含文件」与「汇总文件数与大小」时出现于文件叶子）：该文件的**逻辑大小**（字节），与 `totalSize` 同一单位口径。

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
