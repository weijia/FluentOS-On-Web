/**
 * FluentOS Service Worker
 *
 * 主要用途：为「网页更新检测 + 用户提示刷新」提供载体（PWA）。
 *
 * 版本戳：2.6.261028a（每次发版必须 bump 本行，否则浏览器逐字节对比 sw.js 不会触发 update）
 *
 * 设计要点：
 *   1) importScripts 引入 js/core/resource-manifest.js（由 scripts/generate-resource-manifest.ps1 生成）。
 *      任何 js / css / Theme 文件被修改后重新生成清单 ⇒ 浏览器检测到 SW 依赖脚本变化 ⇒ 触发 updatefound，
 *      从而让页面感知到「有新版本」。这是本项目（无构建、无 vite-plugin-pwa）的版本变化信号来源。
 *   2) 必须显式监听 message 并调用 self.skipWaiting()：自动生成的 SW 不监听该事件，
 *      会导致用户点击「刷新」后新版本永远不激活。
 *   3) fetch 采用 network-first：优先走网络保证内容最新，仅在离线时回退缓存；
 *      只处理同源 GET 的安全资源类型，其余请求直接放行，避免影响现有加载逻辑。
 *
 * 注意：本项目资源缓存主要由 boot.js 依据 resource-manifest 的 per-file revision 自行管理
 * （缓存名 fluentos-resource-pack-v1）。本 SW 使用独立的 fluentos-runtime-<hash> 缓存，两者互不干扰。
 */

// 导入资源清单；失败也不能让 SW 安装失败
try {
    self.importScripts('./js/core/resource-manifest.js');
} catch (_) { /* 清单缺失时按 dev 版本处理 */ }

var MANIFEST = globalThis.FluentOSResourceManifest || null;
var SYSTEM_VERSION = (MANIFEST && MANIFEST.systemVersion) || 'dev';

// 由「资源清单内容」派生的缓存版本：文件内容变化 ⇒ 清单变化 ⇒ 哈希变化 ⇒ 使用新缓存
async function computeContentVersion() {
    var resources = (MANIFEST && MANIFEST.resources) || {};
    var raw = JSON.stringify(resources);
    try {
        if (globalThis.crypto && crypto.subtle && crypto.subtle.digest) {
            var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
            return Array.from(new Uint8Array(buf))
                .map(function (b) { return b.toString(16).padStart(2, '0'); })
                .join('')
                .slice(0, 12);
        }
    } catch (_) { /* 回退到简单哈希 */ }
    var h = 0;
    for (var i = 0; i < raw.length; i++) {
        h = ((h << 5) - h + raw.charCodeAt(i)) | 0;
    }
    return 'f' + (h >>> 0).toString(16);
}

var CACHE_NAME = 'fluentos-runtime-' + SYSTEM_VERSION;

self.addEventListener('install', function (event) {
    event.waitUntil((async function () {
        try {
            var v = await computeContentVersion();
            CACHE_NAME = 'fluentos-runtime-' + v;
            await caches.open(CACHE_NAME);
        } catch (_) { /* 缓存不可用不影响安装 */ }
        // 重要：这里**不**调用 self.skipWaiting()。
        // 新 SW 保持 waiting 状态，等用户在提示中点「刷新」后才激活（prompt 模式）。
    })());
});

self.addEventListener('activate', function (event) {
    event.waitUntil((async function () {
        try {
            var v = await computeContentVersion();
            CACHE_NAME = 'fluentos-runtime-' + v;
            var keys = await caches.keys();
            await Promise.all(keys
                .filter(function (k) { return k.indexOf('fluentos-runtime-') === 0 && k !== CACHE_NAME; })
                .map(function (k) { return caches.delete(k); }));
        } catch (_) { /* 清理失败不影响激活 */ }
        try {
            await self.clients.claim();
        } catch (_) { /* claim 失败可忽略 */ }
    })());
});

// 关键：接收页面发来的 SKIP_WAITING，让等待中的新 SW 立即激活
self.addEventListener('message', function (event) {
    var data = event.data;
    if (data && data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// 安全的资源类型（不处理 XHR/fetch 等 destination 为 '' 的请求，避免缓存接口响应）
var SAFE_DESTINATIONS = ['document', 'script', 'style', 'image', 'font', 'manifest', 'audio', 'video'];

self.addEventListener('fetch', function (event) {
    var req = event.request;
    if (!req || req.method !== 'GET') return;

    var url;
    try {
        url = new URL(req.url);
    } catch (_) {
        return;
    }
    if (url.origin !== self.location.origin) return;               // 只处理同源
    if (req.destination && SAFE_DESTINATIONS.indexOf(req.destination) === -1) return;

    event.respondWith((async function () {
        try {
            // 关键：用 cache:'no-cache' 绕过浏览器 HTTP 缓存（服务器发 max-age=1200），
            // 否则同名脚本在 20 分钟内不会回源，部署后用户永远拿到旧 JS。
            var res = await fetch(req, { cache: 'no-cache' });
            // 网络可用：写入运行时缓存（不阻塞响应）
            if (res && res.ok && res.type === 'basic') {
                try {
                    var cache = await caches.open(CACHE_NAME);
                    cache.put(req, res.clone());
                } catch (_) { /* 写入缓存失败可忽略 */ }
            }
            return res;
        } catch (err) {
            // 离线：回退缓存
            try {
                var cached = await caches.match(req);
                if (cached) return cached;
            } catch (_) { /* 忽略 */ }
            throw err;
        }
    })());
});
