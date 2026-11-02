/* sync-dedup.test.js — 针对 sync-dedup.js（身份归一化 / 去重键）的单元测试。
 * 运行：node --test（或 npm test）。
 *
 * 覆盖的核心回归点：
 *  - Gitee baseUrl 为空 / 未设置 / 填默认 URL 应折叠成同一条（此前 vendor 去重键把 "" 与
 *    "https://gitee.com/api/v5" 判成两个不同后端 → 同仓库不判重）。
 *  - baseUrl 尾部斜杠归一化。
 *  - token 不在 Gitee 身份里（同仓库不同 token 仍判为同一条）。
 *  - RemoteStorage / 不同后端类型不误判。
 */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const SD = require('./sync-dedup.js');

test('Gitee baseUrl 空串与默认端点折叠为同一条（核心回归）', () => {
  const a = SD.backendDedupKey('Gitee', { owner: 'u', repo: 'r', branch: 'master', baseUrl: '' });
  const b = SD.backendDedupKey('Gitee', { owner: 'u', repo: 'r', branch: 'master', baseUrl: 'https://gitee.com/api/v5' });
  assert.equal(a, b, '空 baseUrl 应与默认 URL 同键');
});

test('Gitee baseUrl 未设置与默认端点折叠为同一条', () => {
  const a = SD.backendDedupKey('Gitee', { owner: 'u', repo: 'r', branch: 'master' });
  const b = SD.backendDedupKey('Gitee', { owner: 'u', repo: 'r', branch: 'master', baseUrl: 'https://gitee.com/api/v5' });
  assert.equal(a, b);
});

test('Gitee baseUrl 尾部斜杠归一化', () => {
  const a = SD.backendDedupKey('Gitee', { owner: 'u', repo: 'r', branch: 'master', baseUrl: 'https://gitee.com/api/v5/' });
  const b = SD.backendDedupKey('Gitee', { owner: 'u', repo: 'r', branch: 'master', baseUrl: 'https://gitee.com/api/v5' });
  assert.equal(a, b);
});

test('Gitee 同仓库不同 token 仍判为同一条（token 不在身份字段）', () => {
  const a = SD.backendDedupKey('Gitee', { owner: 'u', repo: 'r', branch: 'master', baseUrl: '', token: 't1' });
  const b = SD.backendDedupKey('Gitee', { owner: 'u', repo: 'r', branch: 'master', baseUrl: '', token: 't2' });
  assert.equal(a, b);
});

test('Gitee 不同仓库判为不同条', () => {
  const a = SD.backendDedupKey('Gitee', { owner: 'u', repo: 'r1', branch: 'master', baseUrl: '' });
  const b = SD.backendDedupKey('Gitee', { owner: 'u', repo: 'r2', branch: 'master', baseUrl: '' });
  assert.notEqual(a, b);
});

test('Gitee 不同 branch 判为不同条', () => {
  const a = SD.backendDedupKey('Gitee', { owner: 'u', repo: 'r', branch: 'master', baseUrl: '' });
  const b = SD.backendDedupKey('Gitee', { owner: 'u', repo: 'r', branch: 'dev', baseUrl: '' });
  assert.notEqual(a, b);
});

test('Gitee 与 GitHub 默认端点互不混淆', () => {
  const g = SD.backendDedupKey('Gitee', { owner: 'u', repo: 'r', branch: 'master', baseUrl: '' });
  const gh = SD.backendDedupKey('GitHub', { owner: 'u', repo: 'r', branch: 'main', baseUrl: '' });
  assert.notEqual(g, gh);
  assert.equal(SD.backendDedupKey('GitHub', { owner: 'u', repo: 'r', branch: 'main', baseUrl: '' }),
    SD.backendDedupKey('GitHub', { owner: 'u', repo: 'r', branch: 'main', baseUrl: 'https://api.github.com' }));
});

test('RemoteStorage 身份字段不变：href+token+basePath', () => {
  const a = SD.backendDedupKey('RemoteStorage', { href: 'u@5apps.com', token: 't', basePath: '/' });
  const b = SD.backendDedupKey('RemoteStorage', { href: 'u@5apps.com', token: 't', basePath: '/' });
  assert.equal(a, b);
  const c = SD.backendDedupKey('RemoteStorage', { href: 'u@5apps.com', token: 't', basePath: '/x' });
  assert.notEqual(a, c);
});

test('sameIdentity 正确判定', () => {
  assert.equal(SD.sameIdentity('Gitee', { owner: 'u', repo: 'r', baseUrl: '' }, 'Gitee', { owner: 'u', repo: 'r', baseUrl: 'https://gitee.com/api/v5' }), true);
  assert.equal(SD.sameIdentity('Gitee', { owner: 'u', repo: 'r', baseUrl: '' }, 'Gitee', { owner: 'u', repo: 'x', baseUrl: '' }), false);
  assert.equal(SD.sameIdentity('Gitee', { owner: 'u', repo: 'r', baseUrl: '' }, 'RemoteStorage', { href: 'u@5apps.com' }), false);
});

// ── 上传目标选择（pickRemoteDataGroup / remoteBackendTypes）──

function mockRepo(groups, configBackends) {
  // groups: [{ id, backends: [{type, options?}] }]；configBackends: 配置仓库的远端后端。
  return {
    listAppDataGroups: async () => groups.map((g) => ({ id: g.id })),
    getAppDataGroup: async (id) => {
      const g = groups.find((x) => x.id === id);
      if (!g) throw new Error('missing ' + id);
      return { id: g.id, listBackends: () => g.backends, fs: 'fs-' + g.id };
    },
    getBackends: async () => ({ backends: configBackends || [] }),
  };
}

const CFG = { type: 'Gitee', options: { owner: 'cfg', repo: 'cfg-repo', baseUrl: '' } };

test('remoteBackendTypes 排除本地-only、保留远端', () => {
  assert.deepEqual(SD.remoteBackendTypes([
    { type: 'InMemory' }, { type: 'IndexedDB' }, { type: 'Gitee' }, { type: 'RemoteStorage' },
  ]), ['Gitee', 'RemoteStorage']);
  assert.deepEqual(SD.remoteBackendTypes([]), []);
  assert.deepEqual(SD.remoteBackendTypes(null), []);
});

test('pickRemoteDataGroup 跳过与配置同仓库的数据组、挑独立远端组', async () => {
  const repo = mockRepo([
    { id: 'app-data', backends: [{ type: 'Gitee', options: { owner: 'cfg', repo: 'cfg-repo' } }] }, // 与配置同仓库
    { id: 'local-only', backends: [{ type: 'IndexedDB' }] },
    { id: 'user-dg', backends: [{ type: 'Gitee', options: { owner: 'me', repo: 'data-repo' } }] },    // 独立数据仓库
  ], [CFG]);
  const dg = await SD.pickRemoteDataGroup(repo);
  assert.ok(dg, '应挑到数据组');
  assert.equal(dg.id, 'user-dg');
});

test('pickRemoteDataGroup 仅配置同仓库数据组时返回 null（避免落回配置组）', async () => {
  const repo = mockRepo([
    { id: 'app-data', backends: [{ type: 'Gitee', options: { owner: 'cfg', repo: 'cfg-repo' } }] },
  ], [CFG]);
  assert.equal(await SD.pickRemoteDataGroup(repo), null);
});

test('pickRemoteDataGroup 无配置后端信息时退回“挑首个含远端后端”', async () => {
  const repo = mockRepo([
    { id: 'local-only', backends: [{ type: 'IndexedDB' }] },
    { id: 'gitee-dg', backends: [{ type: 'Gitee', options: { owner: 'me', repo: 'r' } }] },
  ]);
  const dg = await SD.pickRemoteDataGroup(repo);
  assert.ok(dg);
  assert.equal(dg.id, 'gitee-dg');
});

test('pickRemoteDataGroup 无远端后端返回 null', async () => {
  const repo = mockRepo([
    { id: 'a', backends: [{ type: 'IndexedDB' }] },
    { id: 'b', backends: [] },
  ]);
  assert.equal(await SD.pickRemoteDataGroup(repo), null);
});

test('pickRemoteDataGroup 对空仓库 / 无 repo 返回 null', async () => {
  assert.equal(await SD.pickRemoteDataGroup(mockRepo([])), null);
  assert.equal(await SD.pickRemoteDataGroup(null), null);
  assert.equal(await SD.pickRemoteDataGroup({}), null);
});

