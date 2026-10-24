# 目录结构清单生成器（本地 Web App）

把本地真实目录树转化为 **RemoteStorage 目录结构清单（manifest）JSON**，无需在 RemoteStorage 中
真正建立所有文件夹。对应设计文档：`FluentOS-On-Web/remotestorage-fs-plan.md`（形态 B）。

## 功能
- 浏览本机真实磁盘：页面打开即显示「此电脑」根节点，下列出本机所有驱动器（C:、D: …）。
- 目录**逐层懒加载**：点开某层才向本地服务请求下一层（适合大目录，默认不选中，避免误把整块磁盘选入清单）。
- 勾选需要包含到清单中的目录（级联勾选 / 全选 / 全不选 / 展开折叠）。
- **目录标签**：后端按目录内容**自动打标签**（如含 `.git` ⇒ `git`、含 `package.json` ⇒ `node`、含 `Cargo.toml` ⇒ `rust` 等，规则见 `serve.js` 的 `TAG_RULES`）；用户也可对任意目录**手动加/删标签**（点目录行的「+标签」）。
- 实时生成 manifest JSON 预览，可**下载**或**复制**。
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
  "root": { "name": "<computerId>", "type": "folder", "children": [ { "name": "C:", "type": "folder", "children": [
    { "name": "Projects", "type": "folder", "tags": ["git", "node"], "children": [] }
  ] } ] }
}
```

> - `root.name` / `source` 取**本机 ID**（`os.hostname()`，由 `GET /api/drives` 的 `computerId` 字段返回），
>   这样多台电脑各自生成的清单互不混淆、可在文件管理器中按电脑区分挂载。
> - `tags` 为可选字段：自动标签（后端探测）与手动标签合并去重后写入，便于读取侧按标签筛选/展示；无标签时不出现该字段。

## 参数持久化（自动填入）
RemoteStorage 的服务器地址 / Token / 基础路径 / 清单文件名，以及「包含文件」选项，会**自动保存到本地服务**（`PUT /api/settings`，落盘到 `app_data/folders/<主机名>.json`），刷新页面后**自动回填**，无需重填。
> ⚠️ 该文件含 Token 明文，已被 `dir-struct-gen/.gitignore` 排除，切勿提交。

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
