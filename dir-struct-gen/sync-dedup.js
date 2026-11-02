/* sync-dedup.js — 同步组后端的身份归一化与去重键。
 *
 * 供两处复用：
 *  1) 浏览器端：作为全局 SyncDedup，供 app.js 在给 app-data 数据组镜像远端后端时按“身份”判重；
 *  2) Node 端：单元测试 require 本文件（node:test）验证归一化 / 去重键行为。
 *
 * 背景：vendor/zen-fs-config-ui.js 的 backendDedupKey 用“原始 options”里的 identityFields
 * 算身份，Gitee/GitHub 的 identityFields 含 baseUrl，而 baseUrl="" 在运行时等价于默认端点
 * （zen-fs-gitee.global.js: this.baseUrl = options.baseUrl || "https://gitee.com/api/v5"），
 * 但去重键把 "" 与 "https://gitee.com/api/v5" 当成两个不同值 → 同仓库后端不判重。
 * 这里统一做归一化：空/默认 baseUrl 折叠为默认端点，并去掉尾斜杠。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SyncDedup = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var GITEE_DEFAULT = 'https://gitee.com/api/v5';
  var GITHUB_DEFAULT = 'https://api.github.com';

  // 与 vendor 中各后端注册的 identityFields 保持一致
  var IDENTITY_FIELDS = {
    Gitee: ['owner', 'repo', 'branch', 'baseUrl'],
    GitHub: ['owner', 'repo', 'branch', 'baseUrl'],
    RemoteStorage: ['href', 'token', 'basePath'],
    WebDAV: ['baseUrl'],
  };

  // 归一化 baseUrl：空串/未设置 → 默认端点；去掉尾部斜杠（"" 与默认、与带斜杠的同一端点折叠）。
  function normalizeBaseUrl(type, baseUrl) {
    var dflt = type === 'Gitee' ? GITEE_DEFAULT : type === 'GitHub' ? GITHUB_DEFAULT : null;
    if (dflt === null) return baseUrl;
    if (baseUrl === '' || baseUrl == null) return dflt;
    return String(baseUrl).replace(/\/+$/, '');
  }

  // 取身份字段子集并归一化（与 vendor identityOptions 语义一致，额外做 baseUrl 归一化）。
  function identityOptions(type, options) {
    var fields = IDENTITY_FIELDS[type] || [];
    var opts = options || {};
    // 对 Gitee/GitHub：未设置或设为空的 baseUrl，先归一化为默认端点，
    // 使“未设置”“空串”“填默认 URL”三者折叠成同一条（这是本模块要修复的核心回归）。
    if ((type === 'Gitee' || type === 'GitHub') && (opts.baseUrl === void 0 || opts.baseUrl === '')) {
      opts = Object.assign({}, opts);
      opts.baseUrl = type === 'Gitee' ? GITEE_DEFAULT : GITHUB_DEFAULT;
    }
    var subset = {};
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (opts[f] !== void 0) subset[f] = opts[f];
    }
    if (type === 'Gitee' || type === 'GitHub') {
      if (subset.baseUrl !== void 0) subset.baseUrl = normalizeBaseUrl(type, subset.baseUrl);
    }
    return subset;
  }

  function sortKeysDeep(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sortKeysDeep);
    var sorted = {};
    var keys = Object.keys(obj).sort();
    for (var i = 0; i < keys.length; i++) {
      sorted[keys[i]] = sortKeysDeep(obj[keys[i]]);
    }
    return sorted;
  }

  function stableKey(options) {
    if (!options || typeof options !== 'object') return '{}';
    return JSON.stringify(sortKeysDeep(options));
  }

  // 去重键：type + 归一化后的身份子集（与 vendor backendDedupKey 同构，但 baseUrl 已归一化）。
  function backendDedupKey(type, options) {
    return type + ':' + stableKey(identityOptions(type, options));
  }

  // 供 app.js 用：判定“已有后端 existing 是否与候选 candidate 同一身份”。
  function sameIdentity(existingType, existingOptions, candidateType, candidateOptions) {
    return backendDedupKey(existingType, existingOptions) === backendDedupKey(candidateType, candidateOptions);
  }

  // 本地-only 后端类型（数据同步组里只有这类后端时，不构成可上传的远端目标）。
  var LOCAL_BACKEND_TYPES = { InMemory: true, IndexedDB: true };

  // 排除本地-only 后端，返回真正的远端后端类型列表。
  function remoteBackendTypes(backends) {
    return (backends || []).filter(function (b) { return b && !LOCAL_BACKEND_TYPES[b.type]; }).map(function (b) { return b.type; });
  }

  // 供 app.js 在 config-sync 连接时调用：从配置仓库登记的数据同步组里挑一个
  // “含远端后端、且远端与配置仓库不同仓库”的作为上传目标。
  // 规则：跳过所有远端后端都与配置仓库同仓库的数据组（例如旧版自动建的 app-data /
  // default 组同步到配置远端），避免上传再次落回配置同步组；找不到则返回 null（上传保持不可用）。
  // repo 需提供 listAppDataGroups()、getAppDataGroup(id)、getBackends()。
  async function pickRemoteDataGroup(repo) {
    if (!repo || typeof repo.listAppDataGroups !== 'function') return null;
    try {
      // 配置仓库自身的远端后端身份键集合（用于判断数据组是否“同仓库”）。
      var cfgKeys = {};
      try {
        var meta = await repo.getBackends();
        var cb = (meta && meta.backends) || [];
        for (var i = 0; i < cb.length; i++) {
          var bt = cb[i].type;
          if (LOCAL_BACKEND_TYPES[bt]) continue;
          cfgKeys[backendDedupKey(bt, cb[i].options)] = true;
        }
      } catch (_) { /* 取不到配置后端时，按“全部视为不同仓库”处理 */ }
      var groups = await repo.listAppDataGroups();
      for (var j = 0; j < groups.length; j++) {
        var g = groups[j];
        var dg = g;
        try { dg = await repo.getAppDataGroup(g.id); } catch (_) { continue; }
        var bs = dg.listBackends ? dg.listBackends() : [];
        var remote = bs.filter(function (b) { return b && !LOCAL_BACKEND_TYPES[b.type]; });
        if (remote.length === 0) continue;
        // 只要存在一个“与配置仓库不同”的远端后端，就采用该数据组。
        var hasDistinct = remote.some(function (b) { return !cfgKeys[backendDedupKey(b.type, b.options)]; });
        if (hasDistinct) return dg;
      }
    } catch (_) { /* 无法枚举时静默，保持上传不可用 */ }
    return null;
  }

  return {
    GITEE_DEFAULT: GITEE_DEFAULT,
    GITHUB_DEFAULT: GITHUB_DEFAULT,
    IDENTITY_FIELDS: IDENTITY_FIELDS,
    normalizeBaseUrl: normalizeBaseUrl,
    identityOptions: identityOptions,
    stableKey: stableKey,
    backendDedupKey: backendDedupKey,
    sameIdentity: sameIdentity,
    remoteBackendTypes: remoteBackendTypes,
    pickRemoteDataGroup: pickRemoteDataGroup,
  };
});
