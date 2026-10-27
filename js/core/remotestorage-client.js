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
            throw new RSClientError(err && err.message ? err.message : 'network error', 'network');
        }
        if (res.status === 401 || res.status === 403) {
            throw new RSClientError('HTTP ' + res.status, 'auth');
        }
        if (res.status === 404) {
            throw new RSClientError('HTTP 404', 'notfound');
        }
        if (!res.ok) {
            throw new RSClientError('HTTP ' + res.status, 'unknown');
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

    function clearCache(connId) {
        if (!connId) {
            cache.clear();
            return;
        }
        const prefix = connId + '::';
        for (const k of Array.from(cache.keys())) {
            if (k.indexOf(prefix) !== -1 || k.endsWith('::' + connId)) cache.delete(k);
        }
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
        clearCache,
        getConnections,
        getConnection
    };
})(typeof window !== 'undefined' ? window : this);
