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

test('pickRemoteDataGroup：本地存储损坏不再静默返回 null', async () => {
  const storageErr = Object.assign(new Error('Failed to create local primary'), {
    code: 'LOCAL_STORAGE_UNAVAILABLE',
    groupId: 'default',
  });
  const repo = {
    getBackends: async () => ({ backends: [] }),
    listAppDataGroups: async () => [{ id: 'default' }],
    getAppDataGroup: async () => { throw storageErr; },
  };
  await assert.rejects(
    () => SD.pickRemoteDataGroup(repo),
    (err) => err.code === 'LOCAL_STORAGE_UNAVAILABLE' && err.groupId === 'default',
  );
});

test('pickRemoteDataGroup：普通实例化失败仍保持“无可用组”（不误报损坏）', async () => {
  const repo = {
    getBackends: async () => ({ backends: [] }),
    listAppDataGroups: async () => [{ id: 'g1' }],
    getAppDataGroup: async () => { throw new Error('descriptor missing'); },
  };
  assert.equal(await SD.pickRemoteDataGroup(repo), null);
});

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

// ── 清单落点推导（manifestPlan）与幂等签名（stableSignature）──

test('manifestPlan：只有 Gitee → 前缀 app_data/folders', () => {
  const plan = SD.manifestPlan([{ id: 'g', type: 'Gitee', options: { owner: 'u', repo: 'r' } }]);
  assert.equal(plan.ok, true);
  assert.equal(plan.prefix, 'app_data/folders');
});

test('manifestPlan：RemoteStorage basePath=app_data/folders → 前缀为空', () => {
  const plan = SD.manifestPlan([{ id: 'rs', type: 'RemoteStorage', options: { basePath: '/app_data/folders/' } }]);
  assert.equal(plan.ok, true);
  assert.equal(plan.prefix, '');
});

test('manifestPlan：RS 根 + Gitee 仓库根 → 前缀一致，可用', () => {
  const plan = SD.manifestPlan([
    { id: 'rs', type: 'RemoteStorage', options: { basePath: '/' } },
    { id: 'g', type: 'Gitee', options: {} },
  ]);
  assert.equal(plan.ok, true);
  assert.equal(plan.prefix, 'app_data/folders');
});

test('manifestPlan：RS 与 Gitee 基准不一致 → 仍可生成，前缀按最深基准取', () => {
  const plan = SD.manifestPlan([
    { id: 'rs', type: 'RemoteStorage', options: { basePath: '/app_data/folders/' } },
    { id: 'g', type: 'Gitee', options: {} },
  ]);
  assert.equal(plan.ok, true);
  assert.equal(plan.prefix, '');
  assert.deepEqual(plan.types.sort(), ['Gitee', 'RemoteStorage']);
});

test('manifestPlan：基准不在 MANIFEST_BASE 链上 → 仍可生成，按仓库根取前缀', () => {
  const plan = SD.manifestPlan([{ id: 'rs', type: 'RemoteStorage', options: { basePath: '/other' } }]);
  assert.equal(plan.ok, true);
  assert.equal(plan.prefix, 'app_data/folders');
});

test('manifestPlan：基准比 MANIFEST_BASE 更深 → 前缀为空，不再叠加一层', () => {
  const plan = SD.manifestPlan([{ id: 'rs', type: 'RemoteStorage', options: { basePath: '/app_data/folders/extra' } }]);
  assert.equal(plan.ok, true);
  assert.equal(plan.prefix, '');
});

test('manifestPlan：RemoteStorage 未填 basePath（后端根为 app_data/）→ 取 folders 前缀不叠加', () => {
  const plan = SD.manifestPlan([
    { id: 'rs', type: 'RemoteStorage', options: {} },
    { id: 'g', type: 'Gitee', options: {} },
  ]);
  assert.equal(plan.ok, true);
  assert.equal(plan.prefix, 'folders');
});

test('manifestPlan：无远端后端 / 本地-only → 不可用', () => {
  assert.equal(SD.manifestPlan([]).ok, false);
  assert.equal(SD.manifestPlan([{ id: 'mem', type: 'IndexedDB', options: {} }]).ok, false);
});

test('declaredBackends 优先 listDeclaredBackends，缺失时回退已连接列表', () => {
  const declared = [{ id: 'a', type: 'Gitee', options: {} }, { id: 'b', type: 'RemoteStorage', options: {} }];
  assert.deepEqual(SD.declaredBackends({ listDeclaredBackends: () => declared, listBackends: () => [declared[0]] }), declared);
  assert.deepEqual(SD.declaredBackends({ listBackends: () => [declared[0]] }), [declared[0]]);
  assert.deepEqual(SD.declaredBackends(null), []);
});

test('stableSignature 忽略 generatedAt/updatedAt，但识别真实内容变化', () => {
  const a = { generatedAt: '2026-01-01T00:00:00Z', children: [{ name: 'a', updatedAt: 1 }] };
  const b = { generatedAt: '2026-02-02T00:00:00Z', children: [{ name: 'a', updatedAt: 999 }] };
  const c = { generatedAt: '2026-02-02T00:00:00Z', children: [{ name: 'b', updatedAt: 1 }] };
  assert.equal(SD.stableSignature(a), SD.stableSignature(b));
  assert.notEqual(SD.stableSignature(a), SD.stableSignature(c));
});

