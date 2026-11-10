/**
 * RemoteStorage 轻量直连客户端（FluentOS-On-Web 文件管理器读取侧）
 *
 * 本期仅「只读」：提供两种数据源的读取能力
 *   (A) 实时目录：GET 目录 listing，筛出以 "/" 结尾的子目录；
 *   (B) 目录结构清单：GET 单个 manifest 文件，解析出整棵目录树。
 *
 * 直接用 fetch 请求 RemoteStorage（无需 import zen-fs-remotestoragejs 的 TS 包）。
 * 后续可替换为 vendored zen-fs-remotestoragejs 的 readdir / readFile，对上层透明。
 *
 * 挂载为全局 window.RemoteStorageClient（纯脚本工程，无模块系统）。
 */
(function (global) {
    'use strict';

    class RSClientError extends Error {
        constructor(message, kind) {
            super(message);
            this.name = 'RSClientError';
            this.kind = kind || 'unknown'; // 'auth' | 'notfound' | 'network' | 'unknown'
        }
    }

    function normalizeHref(href) {
        if (!href) return '/';
        return href.endsWith('/') ? href : href + '/';
    }

    // 把 href 与（可能以 / 开头的）路径拼成合法 URL，避免双斜杠/缺失斜杠。
    function joinUrl(href, path) {
        const h = normalizeHref(href);
        const p = (path || '').replace(/^\/+/, '');
        return h + p;
    }

    // 会话内缓存：key -> Promise<数据>，避免同一目录/清单重复请求。
    const cache = new Map();
    function cacheKey(prefix, cfg) {
        const href = normalizeHref(cfg.href || '');
        const token = cfg.token || '';
        const target = cfg.path || cfg.manifestFile || '';
        return `${prefix}::${href}::${token}::${target}`;
    }

    async function fetchJson(url, token) {
        const headers = { Accept: 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        let res;
        try {
            res = await fetch(url, { method: 'GET', headers });
        } catch (err) {
            throw new RSClientError((err && err.message ? err.message : 'network error') + '（' + url + '）', 'network');
        }
        if (res.status === 401 || res.status === 403) {
            throw new RSClientError('HTTP ' + res.status + '（' + url + '）：请检查 Token 是否正确', 'auth');
        }
        if (res.status === 404) {
            throw new RSClientError('HTTP 404（' + url + '）', 'notfound');
        }
        if (!res.ok) {
            throw new RSClientError('HTTP ' + res.status + '（' + url + '）', 'unknown');
        }
        try {
            return await res.json();
        } catch (err) {
            throw new RSClientError('响应不是合法 JSON', 'unknown');
        }
    }

    // RemoteStorage 目录 listing 响应按 spec 是 { "@context": ..., "items": { "name/": {...}, "file": {...} } }。
    // 有些私有实现会直接把条目平铺在顶层；两种格式都兼容：优先取 items，否则用顶层对象本身。
    function unwrapListing(listing) {
        if (listing && typeof listing === 'object' && listing.items && typeof listing.items === 'object') {
            return listing.items;
        }
        return (listing && typeof listing === 'object') ? listing : {};
    }

    // (A) 读取某目录下的子目录列表
    // cfg: { href, token, path }  path 为远程文件夹路径（含结尾 "/"，可省略）
    // 返回: [{ name, path, isDirectory:true, etag? }]
    async function listDirectories(cfg) {
        const key = cacheKey('dir', cfg);
        if (cache.has(key)) return cache.get(key);
        const url = joinUrl(cfg.href, cfg.path || '/');
        const promise = (async () => {
            const listing = await fetchJson(url, cfg.token);
            const entries = unwrapListing(listing);
            const dirs = [];
            for (const name of Object.keys(entries)) {
                if (name.endsWith('/')) {
                    const sub = name.slice(0, -1);
                    const entry = entries[name] || {};
                    dirs.push({
                        name: sub,
                        path: normalizeHref(cfg.path || '/') + name, // 含结尾 "/"
                        isDirectory: true,
                        etag: entry.ETag || entry.etag || null
                    });
                }
            }
            dirs.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
            return dirs;
        })();
        cache.set(key, promise);
        return promise;
    }

    // (A2) 读取某目录下的文件列表（可选按扩展名过滤，如 '.json'）
    // cfg: { href, token, path, ext }   path 为远程文件夹路径（含结尾 "/"，可省略）
    // 返回: [{ name, path, etag?, contentType?, contentLength? }]
    async function listFiles(cfg) {
        const extPart = cfg.ext ? ('|' + String(cfg.ext).toLowerCase()) : '';
        const key = cacheKey('files', Object.assign({}, cfg, { path: (cfg.path || '') + extPart }));
        if (cache.has(key)) return cache.get(key);
        const url = joinUrl(cfg.href, cfg.path || '/');
        const promise = (async () => {
            const listing = await fetchJson(url, cfg.token);
            const entries = unwrapListing(listing);
            const files = [];
            const ext = cfg.ext ? String(cfg.ext).toLowerCase() : '';
            for (const name of Object.keys(entries)) {
                if (name.endsWith('/')) continue; // 跳过目录
                if (ext && !name.toLowerCase().endsWith(ext)) continue;
                const entry = entries[name] || {};
                files.push({
                    name,
                    path: normalizeHref(cfg.path || '/') + name, // 完整相对路径
                    etag: entry.ETag || entry.etag || null,
                    contentType: entry['Content-Type'] || null,
                    contentLength: (entry['Content-Length'] != null) ? entry['Content-Length'] : null
                });
            }
            files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
            return files;
        })();
        cache.set(key, promise);
        return promise;
    }

    // (B) 读取清单文件并解析为树
    // cfg: { href, token, manifestFile }
    // 返回: { root: { name, type:'folder', children:[] } , meta:{...} }
    async function fetchManifest(cfg) {
        const key = cacheKey('manifest', cfg);
        if (cache.has(key)) return cache.get(key);
        const url = joinUrl(cfg.href, cfg.manifestFile || '/fs-manifest.json');
        const promise = (async () => {
            const data = await fetchJson(url, cfg.token);
            if (!data || typeof data !== 'object' || !data.root || data.root.type !== 'folder') {
                throw new RSClientError('清单格式不正确：缺少 root 或 root.type 非 folder', 'unknown');
            }
            return { root: data.root, meta: data };
        })();
        cache.set(key, promise);
        return promise;
    }

    // ---------- v2 目录结构清单：主机索引 + 卷分片 → 一棵目录树 ----------
    //
    // 格式（dir-struct-manifest-format.md v2）：
    //   <base>/struct/<host>.json                 主机索引 { version:2, source, mounts:[{volumeId, files:[基名]}] }
    //   <base>/struct/<volumeId>.<createdAt>.json 卷分片 { volumeId, name, type:'folder', part, children }
    //   <base>/struct/<volumeKey>.json            旧版单文件卷（历史数据，仍兼容）
    //   <base>/<file>.json                        旧版 v1 整树清单 { root:{...} }（回退兼容）
    // 读取侧按 mounts 的 files 取分片，同一 volumeId 的多份分片合并成一棵树。

    const MERGE_TIME_TOLERANCE_MS = 5 * 60 * 1000;

    function toEpochMs(v) {
        if (typeof v === 'number' && isFinite(v)) return v;
        if (typeof v === 'string' && v) {
            const t = Date.parse(v);
            return isNaN(t) ? null : t;
        }
        return null;
    }

    function maxStamp(x, y) {
        if (x == null) return y == null ? null : y;
        if (y == null) return x;
        return Math.max(x, y);
    }

    function nodeStamp(node, fileStamp) {
        const own = toEpochMs(node && node.updatedAt);
        return own != null ? own : (fileStamp == null ? null : fileStamp);
    }

    // 冲突归属：时间较新者胜；时间缺失/在容差内 → 按分片 id 字典序兜底，保证结果确定。
    function pickNewerSide(aStamp, bStamp, aPart, bPart) {
        if (aStamp != null && bStamp != null && Math.abs(aStamp - bStamp) > MERGE_TIME_TOLERANCE_MS) {
            return aStamp > bStamp ? 'a' : 'b';
        }
        const pa = aPart || '';
        const pb = bPart || '';
        if (pa === pb) return 'a';
        return pa > pb ? 'a' : 'b';
    }

    // 目录优先 + 名称数字感知排序（递归）。
    function sortManifestChildren(children) {
        children.sort((x, y) => {
            const xf = (x.type || 'folder') === 'folder';
            const yf = (y.type || 'folder') === 'folder';
            if (xf !== yf) return xf ? -1 : 1;
            return String(x.name).localeCompare(String(y.name), undefined, { numeric: true });
        });
        for (const c of children) {
            if (Array.isArray(c.children)) sortManifestChildren(c.children);
        }
        return children;
    }

    function cloneDoc(v) {
        if (typeof structuredClone === 'function') return structuredClone(v);
        return JSON.parse(JSON.stringify(v));
    }

    // 合并两棵子树 / 两份卷分片：children 取并集，同名节点按「最后确认时间」取属性，
    // folder 优先于 file，tags / sources 取并集，leaf 重新计算。
    function mergeVolumeTrees(a, b, ctx) {
        ctx = ctx || {};
        const aPart = ctx.aPart || '';
        const bPart = ctx.bPart || '';
        const aStamp = nodeStamp(a, ctx.aStamp == null ? null : ctx.aStamp);
        const bStamp = nodeStamp(b, ctx.bStamp == null ? null : ctx.bStamp);

        const aFolder = (a.type || 'folder') === 'folder';
        const bFolder = (b.type || 'folder') === 'folder';
        const keepA = aFolder !== bFolder ? aFolder : pickNewerSide(aStamp, bStamp, aPart, bPart) === 'a';

        const map = new Map();
        const put = (child, sidePart, sideStamp) => {
            if (!child || typeof child !== 'object') return;
            const key = String(child.name);
            if (!map.has(key)) {
                map.set(key, { node: child, part: sidePart, stamp: sideStamp });
                return;
            }
            const prev = map.get(key);
            map.set(key, {
                node: mergeVolumeTrees(prev.node, child, {
                    aPart: prev.part,
                    bPart: sidePart,
                    aStamp: prev.stamp,
                    bStamp: sideStamp
                }),
                part: (prev.part || '') > (sidePart || '') ? prev.part : sidePart,
                stamp: maxStamp(prev.stamp, sideStamp)
            });
        };
        for (const c of Array.isArray(a.children) ? a.children : []) put(c, aPart, aStamp);
        for (const c of Array.isArray(b.children) ? b.children : []) put(c, bPart, bStamp);
        const children = sortManifestChildren([...map.values()].map((x) => x.node));

        const out = Object.assign({}, keepA ? a : b, { children });
        const tags = [...new Set([...(a.tags || []), ...(b.tags || [])])];
        if (tags.length) out.tags = tags; else delete out.tags;
        const sources = [...new Set([...(a.sources || []), ...(b.sources || [])])];
        if (sources.length) out.sources = sources; else delete out.sources;
        const vid = a.volumeId || b.volumeId;
        if (vid) out.volumeId = vid;

        if ((out.type || 'folder') === 'folder') {
            const hasFolderChild = children.some((c) => (c.type || 'folder') === 'folder');
            if (hasFolderChild) delete out.leaf;
            else if (a.leaf === true || b.leaf === true) out.leaf = true;
            else delete out.leaf;
        }

        const stamp = maxStamp(aStamp, bStamp);
        if (stamp != null) out.updatedAt = stamp; else delete out.updatedAt;
        if (out.part && aPart !== bPart) delete out.part;
        return out;
    }

    function partIdOfDoc(doc) {
        if (!doc) return '';
        if (doc.part && doc.part.id) return String(doc.part.id);
        if (Array.isArray(doc.sources) && doc.sources.length) return String(doc.sources[0]);
        return '';
    }

    function docStamp(doc) {
        if (!doc) return null;
        if (doc.part) {
            const t = toEpochMs(doc.part.generatedAt);
            if (t != null) return t;
        }
        return toEpochMs(doc.generatedAt);
    }

    // 把同一块盘的若干分片合并成一棵树；无有效输入返回 null。
    function mergeShards(docs) {
        const valid = docs.filter((d) => d && typeof d === 'object');
        if (!valid.length) return null;
        let acc = null;
        for (const raw of valid) {
            const doc = cloneDoc(raw);
            const part = partIdOfDoc(doc);
            const stamp = docStamp(doc);
            if (!acc) {
                acc = { doc, part, stamp };
                continue;
            }
            const merged = mergeVolumeTrees(acc.doc, doc, {
                aPart: acc.part, bPart: part, aStamp: acc.stamp, bStamp: stamp
            });
            acc = {
                doc: merged,
                part: (acc.part || '') > (part || '') ? acc.part : part,
                stamp: maxStamp(acc.stamp, stamp)
            };
        }
        if (acc && Array.isArray(acc.doc.children)) sortManifestChildren(acc.doc.children);
        return acc ? acc.doc : null;
    }

    // 主机索引的一个 mount 项引用的分片基名（files 优先，回退 file），稳定排序。
    function mountShardBases(mount) {
        const fromFiles = Array.isArray(mount.files)
            ? mount.files
                .map((f) => (typeof f === 'string' ? f : (f && typeof f === 'object' ? f.file : null)))
                .filter((b) => typeof b === 'string' && !!b)
            : [];
        const bases = fromFiles.length
            ? fromFiles
            : (typeof mount.file === 'string' && mount.file ? [mount.file] : []);
        return [...new Set(bases)].sort((a, b) => a.localeCompare(b));
    }

    // 列出目录下的 .json 并逐个读取；目录不存在（404）返回 null。
    // 单个文件读取/解析失败只记入 warnings，不阻断整次读取。
    async function readManifestDocs(href, token, dir, warnings) {
        let files;
        try {
            files = await listFiles({ href, token, path: dir, ext: '.json' });
        } catch (err) {
            if (err && err.kind === 'notfound') return null;
            throw err;
        }
        const docs = [];
        await Promise.all(files.map(async (f) => {
            try {
                const raw = await fetchJson(joinUrl(href, f.path), token);
                if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
                    warnings.push('清单 ' + f.name + ' 不是 JSON 对象，已跳过');
                    return;
                }
                docs.push({ base: f.name.replace(/\.json$/i, ''), name: f.name, raw });
            } catch (err) {
                warnings.push('读取清单 ' + f.name + ' 失败：' + ((err && err.message) || String(err)));
            }
        }));
        docs.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        return { files, docs };
    }

    // 把 struct/ 下读到的全部清单文档拼装成可展示的目录源（主机 / 旧版 v1 / 未索引卷）。
    function buildManifestSources(docs, warnings) {
        const hostIndexes = [];
        const shardByBase = new Map();
        const legacy = [];
        for (const d of docs) {
            const raw = d.raw;
            if (Array.isArray(raw.mounts)) {
                hostIndexes.push(d);
            } else if ('volumeId' in raw && Array.isArray(raw.children) && !raw.root) {
                shardByBase.set(d.base, raw);
            } else if (raw.root && typeof raw.root === 'object') {
                legacy.push(d);
            } else {
                warnings.push('清单 ' + d.name + ' 不是可识别的格式（无 mounts、无 volumeId+children、无 root），已跳过');
            }
        }

        const sources = [];
        for (const l of legacy) {
            const root = l.raw.root;
            if (!Array.isArray(root.children)) root.children = [];
            if (!root.type) root.type = 'folder';
            sources.push({
                key: 'file:' + l.base,
                name: String(root.name || l.base || 'manifest'),
                root
            });
        }

        const referenced = new Set();
        for (const hi of hostIndexes) {
            const index = hi.raw;
            const sourceName = (typeof index.source === 'string' && index.source) ? index.source : hi.base;
            const drives = [];
            const mounts = Array.isArray(index.mounts) ? index.mounts : [];
            for (const m of mounts) {
                if (!m || typeof m !== 'object') continue;
                const label = m.volumeId || m.letter || '?';
                const bases = mountShardBases(m);
                const docsForMount = [];
                const missing = [];
                for (const b of bases) {
                    referenced.add(b);
                    const shard = shardByBase.get(b);
                    if (shard) docsForMount.push(shard); else missing.push(b);
                }
                if (!docsForMount.length) {
                    if (bases.length) {
                        warnings.push('主机 ' + sourceName + ' 的卷 ' + label + ' 没有可读取的分片：' + bases.join(', '));
                    }
                    continue;
                }
                if (missing.length) {
                    warnings.push('主机 ' + sourceName + ' 的卷 ' + label + ' 缺少 ' + missing.length + ' 个分片：' + missing.join(', '));
                }
                const merged = mergeShards(docsForMount);
                if (!merged) continue;
                merged.type = 'folder';
                if (typeof m.letter === 'string' && m.letter) merged.name = m.letter;
                else if (!merged.name) merged.name = String(label);
                drives.push(merged);
            }
            drives.sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { numeric: true }));
            if (!drives.length) {
                warnings.push('主机 ' + sourceName + ' 的主机索引没有可展示的卷（' + mounts.length + ' 个挂载项均无有效分片）');
                continue;
            }
            sources.push({
                key: 'host:' + sourceName,
                name: sourceName,
                root: { name: sourceName, type: 'folder', children: drives }
            });
        }

        // 未被任何主机索引引用的分片按 volumeId 归组，作为「未索引卷」展示，避免丢数据。
        const orphanGroups = new Map();
        for (const [base, raw] of shardByBase) {
            if (referenced.has(base)) continue;
            const vid = (typeof raw.volumeId === 'string' && raw.volumeId) ? raw.volumeId : '';
            const groupKey = vid || ('∅::' + (typeof raw.name === 'string' ? raw.name : base));
            if (!orphanGroups.has(groupKey)) orphanGroups.set(groupKey, []);
            orphanGroups.get(groupKey).push(raw);
        }
        if (orphanGroups.size) {
            const drives = [];
            for (const [, group] of orphanGroups) {
                const merged = mergeShards(group);
                if (!merged) continue;
                merged.type = 'folder';
                if (!merged.name) merged.name = '（未命名卷）';
                drives.push(merged);
            }
            drives.sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { numeric: true }));
            if (drives.length) {
                sources.push({
                    key: 'orphan',
                    name: '（未索引卷）',
                    root: { name: '（未索引卷）', type: 'folder', children: drives }
                });
            }
        }
        return sources;
    }

    // (C) 读取整个清单集合：
    //   - 未指定 manifestFile → 扫描 <base>/struct/ 下全部 .json（v2），404 时回退 <base>/（v1）；
    //   - 指定 manifestFile → 读取该文件所在目录，一并解析主机索引与卷分片。
    // 返回: { sources:[{key,name,root}], warnings:[], dir, files:[] }
    // 完全读不到 / 认不出格式时抛 RSClientError，message 带具体原因，供界面直接展示。
    async function fetchManifestCollection(cfg) {
        const key = ['collection', normalizeHref(cfg.href || ''), cfg.token || '',
            cfg.basePath || '', cfg.manifestFile || ''].join('::');
        if (cache.has(key)) return cache.get(key);
        const promise = (async () => {
            const warnings = [];
            const base = normalizeHref(cfg.basePath || '/app_data/folders/');
            const manifestFile = String(cfg.manifestFile || '').trim();
            let dir;
            let listing;

            if (manifestFile) {
                const filePath = manifestFile.replace(/^\/+/, '');
                const slash = filePath.lastIndexOf('/');
                dir = slash >= 0 ? filePath.slice(0, slash + 1) : base;
                listing = await readManifestDocs(cfg.href, cfg.token, dir, warnings);
                if (!listing) {
                    throw new RSClientError('手动指定的清单目录不存在：' + dir + '（HTTP 404）', 'unknown');
                }
                const targetBase = (filePath.split('/').pop() || '').replace(/\.json$/i, '');
                if (!listing.docs.some((d) => d.base === targetBase)) {
                    throw new RSClientError('手动指定的清单文件不存在或无法解析：' + filePath + '（目录 ' + dir + ' 下未找到可用的同名 .json）', 'unknown');
                }
            } else {
                dir = base + 'struct/';
                listing = await readManifestDocs(cfg.href, cfg.token, dir, warnings);
                if (!listing) {
                    // 兼容历史 v1：清单直接放在 <base>/ 下
                    dir = base;
                    listing = await readManifestDocs(cfg.href, cfg.token, dir, warnings);
                    if (!listing) {
                        throw new RSClientError('清单目录不存在：' + base + 'struct/（HTTP 404）。请确认连接的基础路径与清单同步位置一致。', 'unknown');
                    }
                    warnings.push('未找到 ' + base + 'struct/ 目录，已回退扫描 ' + base + '（仅兼容旧版 v1 清单）');
                }
            }

            if (!listing.files.length) {
                throw new RSClientError('清单目录 ' + dir + ' 下没有任何 .json 文件（目录存在但为空，或清单尚未同步）。', 'unknown');
            }
            if (!listing.docs.length) {
                throw new RSClientError('清单目录 ' + dir + ' 下的 ' + listing.files.length + ' 个 .json 全部读取失败：' + warnings.slice(0, 3).join('；'), 'unknown');
            }
            const sources = buildManifestSources(listing.docs, warnings);
            if (!sources.length) {
                throw new RSClientError('在 ' + dir + ' 找到 ' + listing.docs.length + ' 个清单，但无法组成目录树：'
                    + (warnings.slice(0, 3).join('；') || '没有可识别的主机索引或 v1 清单'), 'unknown');
            }
            return { sources, warnings, dir, files: listing.files.map((f) => f.name) };
        })();
        cache.set(key, promise);
        return promise;
    }

    function clearCache(connId) {
        // 缓存键由 href/token/path 组成，未包含连接 id；刷新时统一清空，确保重试能重新请求。
        cache.clear();
    }

    // 从 State.settings 读取连接配置（供上层便捷调用）
    // 注意：state.js 用 `const State = {...}` 顶层声明，不会挂到 window 上；
    // 必须用裸 State 引用（全局词法环境），不能用 global.State / window.State（它们是 undefined）。
    function getConnections() {
        try {
            const s = (typeof State !== 'undefined') ? State : global.State;
            const rs = (s && s.settings && s.settings.remoteStorage) || {};
            const list = rs.connections || [];
            return list.filter((c) => c && c.enabled !== false);
        } catch (_) {
            return [];
        }
    }

    function getConnection(id) {
        const list = getConnections();
        return list.find((c) => c.id === id) || null;
    }

    global.RemoteStorageClient = {
        RSClientError,
        normalizeHref,
        joinUrl,
        listDirectories,
        listFiles,
        fetchManifest,
        fetchManifestCollection,
        clearCache,
        getConnections,
        getConnection
    };
})(typeof window !== 'undefined' ? window : this);
