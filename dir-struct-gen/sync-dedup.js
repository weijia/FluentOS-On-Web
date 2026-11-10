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

  // onenav 读取清单的固定绝对位置（相对后端账号 / 仓库根）。
  var MANIFEST_BASE = 'app_data/folders';

  function stripSlashes(p) {
    return String(p == null ? '' : p).replace(/^\/+/, '').replace(/\/+$/, '');
  }

  // 数据组的「声明后端」：组内 .meta/backends/ 为准；老版本没有该 API 时回退已连接列表。
  function declaredBackends(group) {
    if (!group) return [];
    var list = typeof group.listDeclaredBackends === 'function' ? group.listDeclaredBackends() : null;
    if (list && list.length) return list;
    return typeof group.listBackends === 'function' ? (group.listBackends() || []) : [];
  }

  // 每个后端把「组根」映射到账号/仓库里的哪个绝对目录：
  // RemoteStorage 由 basePath 决定；Gitee/GitHub/WebDAV 的组根就是仓库根。
  function backendBaseOf(backend) {
    if (!backend) return null;
    if (backend.type === 'RemoteStorage') return stripSlashes((backend.options || {}).basePath);
    return '';
  }

  /**
   * 由后端配置推导「清单该写到哪个相对前缀」。
   * 目标：所有后端都落到 <MANIFEST_BASE>/struct。前缀只能由基准路径算出，不做猜测：
   *   - 任一后端基准无法对齐 → ok=false（调用方必须中止生成，不降级写入）；
   *   - 多个后端要求不同前缀 → ok=false（一个相对路径不可能同时满足两份基准）。
   */
  function manifestPlan(backends) {
    var remotes = (backends || []).filter(function (b) { return b && !LOCAL_BACKEND_TYPES[b.type]; });
    if (!remotes.length) {
      return { ok: false, prefix: null, types: [], reason: '数据组没有可用的远端后端（本地-only 或后端尚未加载）' };
    }
    var prefixes = [];
    var details = [];
    var types = [];
    for (var i = 0; i < remotes.length; i++) {
      var b = remotes[i];
      var base = backendBaseOf(b);
      var prefix;
      if (base === MANIFEST_BASE) prefix = '';
      else if (base === '') prefix = MANIFEST_BASE;
      else {
        return {
          ok: false, prefix: null, types: types,
          reason: b.type + '（' + b.id + '）的基准是 ' + base + '/，无法对齐 ' + MANIFEST_BASE + '/struct',
        };
      }
      prefixes.push(prefix);
      types.push(b.type);
      details.push({ id: b.id, type: b.type, base: base, prefix: prefix });
    }
    var uniq = prefixes.filter(function (v, idx) { return prefixes.indexOf(v) === idx; });
    if (uniq.length > 1) {
      return {
        ok: false, prefix: null, types: types, details: details,
        reason: '后端基准不一致（' + details.map(function (d) {
          return d.type + ':' + (d.prefix === '' ? '<组根>' : d.prefix + '/');
        }).join('，') + '），同一个路径无法同时落到 ' + MANIFEST_BASE + '/struct；'
          + '请把 RemoteStorage 的 basePath 改为 /（与其它后端共用仓库根），或只保留一个远端后端',
      };
    }
    var uniqTypes = types.filter(function (v, idx) { return types.indexOf(v) === idx; });
    return { ok: true, prefix: uniq[0], types: uniqTypes, details: details, reason: '' };
  }

  // 去掉每次生成都会变化的字段后做稳定 JSON，用于判断「内容是否真的变了」。
  var VOLATILE_KEYS = { generatedAt: true, updatedAt: true };

  function stableSignature(value) {
    var walk = function (v) {
      if (Array.isArray(v)) return v.map(walk);
      if (v && typeof v === 'object') {
        var out = {};
        var keys = Object.keys(v).sort();
        for (var i = 0; i < keys.length; i++) {
          if (VOLATILE_KEYS[keys[i]]) continue;
          out[keys[i]] = walk(v[keys[i]]);
        }
        return out;
      }
      return v;
    };
    return JSON.stringify(walk(value));
  }

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
        var bs = declaredBackends(dg);
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
    declaredBackends: declaredBackends,
    manifestPlan: manifestPlan,
    stableSignature: stableSignature,
    MANIFEST_BASE: MANIFEST_BASE,
    pickRemoteDataGroup: pickRemoteDataGroup,
  };
});
