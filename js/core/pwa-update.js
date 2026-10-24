/**
 * PWA 更新检测 + 用户提示刷新（纯脚本，无构建）
 *
 * 参考 weijia/my-skills 仓库的 pwa-update-toast skill，按本项目（无 React / 无 Vite）改写为原生实现：
 *   - 注册 /sw.js（由 sw.js 自行 importScripts 资源清单来感知版本变化）
 *   - 监听 updatefound / statechange：发现新版本已 installed 且存在 controller ⇒ 提示用户
 *   - 页面加载 3 秒后首次检测，之后每 5 分钟轮询 reg.update()
 *   - 用 updateAvailable 标志去重，避免 updatefound / updated 重复触发导致提示重复弹出
 *   - 点击「刷新」：向 waiting worker 发送 SKIP_WAITING，并在 controllerchange 时 reload 一次
 *
 * 挂载为全局脚本（不导出对象），只需在 index.html 中 defer 引入即可。
 */
(function () {
    'use strict';

    var INITIAL_DELAY = 3000;          // 页面加载后首次检测延迟
    var POLL_INTERVAL = 5 * 60 * 1000; // 之后每 5 分钟轮询一次
    var RELOAD_FALLBACK = 3000;        // SKIP_WAITING 后未收到 controllerchange 的兜底刷新延迟

    var updateAvailable = false;       // 去重标志：确保只提示一次
    var reloading = false;
    var toastEl = null;

    // 脚本自身地址 → 推导根目录下的 sw.js（兼容部署在子目录的情况）
    var SCRIPT_SRC = (document.currentScript && document.currentScript.src) || location.href;
    var SW_URL = (function () {
        try {
            return new URL('../../sw.js', SCRIPT_SRC).href;
        } catch (_) {
            return './sw.js';
        }
    })();

    function tr(key, fallback) {
        try {
            if (typeof t === 'function') return t(key);
        } catch (_) { /* i18n 未就绪时用回退文案 */ }
        return fallback;
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function showToast(reg) {
        if (toastEl) return;
        var el = document.createElement('div');
        el.className = 'pwa-update-toast';
        el.innerHTML =
            '<span class="pwa-update-text">' + escapeHtml(tr('pwa.update-available', '新版本可用')) + '</span>' +
            '<button class="pwa-update-btn" type="button">' + escapeHtml(tr('pwa.update-refresh', '点击刷新')) + '</button>';
        el.querySelector('.pwa-update-btn').addEventListener('click', function () {
            applyUpdate(reg);
        });
        document.body.appendChild(el);
        toastEl = el;
    }

    function hideToast() {
        if (toastEl && toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
        toastEl = null;
    }

    // 用户确认刷新：让等待中的新 SW 跳过等待并激活，激活后刷新页面
    function applyUpdate(reg) {
        hideToast();
        var worker = (reg && reg.waiting) || null;
        if (!worker) {
            // 没有等待中的 worker，直接刷新即可
            try { location.reload(); } catch (_) { /* 忽略 */ }
            return;
        }
        try {
            worker.postMessage({ type: 'SKIP_WAITING' });
        } catch (_) { /* 忽略 */ }

        navigator.serviceWorker.addEventListener('controllerchange', function () {
            if (reloading) return;
            reloading = true;
            try { location.reload(); } catch (_) { /* 忽略 */ }
        });

        // 兜底：若 SW 未实现 SKIP_WAITING 导致 controllerchange 始终不触发，也保证刷新
        setTimeout(function () {
            if (reloading) return;
            reloading = true;
            try { location.reload(); } catch (_) { /* 忽略 */ }
        }, RELOAD_FALLBACK);
    }

    // 只通知一次
    function notify(reg) {
        if (updateAvailable) return;
        updateAvailable = true;
        showToast(reg);
    }

    function watchRegistration(reg) {
        if (!reg) return;

        // 刷新前就已经存在 waiting worker 的情况
        if (reg.waiting && navigator.serviceWorker.controller) {
            notify(reg);
        }

        reg.addEventListener('updatefound', function () {
            var newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', function () {
                // 新 worker 已安装且当前页面已被旧 SW 控制 ⇒ 有新版本待激活
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    notify(reg);
                }
            });
        });
    }

    function scheduleChecks(reg) {
        if (!reg) return;
        setTimeout(function () {
            try { reg.update().catch(function () { }); } catch (_) { /* 忽略 */ }
        }, INITIAL_DELAY);
        setInterval(function () {
            try { reg.update().catch(function () { }); } catch (_) { /* 忽略 */ }
        }, POLL_INTERVAL);
    }

    function init() {
        if (!('serviceWorker' in navigator)) return;

        navigator.serviceWorker.register(SW_URL).catch(function () {
            // 注册失败（如不支持 / 非安全上下文）静默处理，不影响主程序
        });

        navigator.serviceWorker.ready.then(function (reg) {
            watchRegistration(reg);
            scheduleChecks(reg);
        }).catch(function () { /* 忽略 */ });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
