#!/usr/bin/env node
/**
 * 用 npm 上正式发布的 zen-fs-config-ui 更新 vendor/zen-fs-config-ui.js。
 *
 * 用法：
 *   node scripts/update-vendor.mjs                 # 版本取自 package.json devDependencies
 *   node scripts/update-vendor.mjs 0.3.11          # 指定版本
 *
 * 流程：npm pack → 解包到临时目录 → 复制 package/dist/zen-fs-config-ui.js
 * → 打印新旧 SHA256 与版本号 → 清理临时目录。
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vendorDir = path.join(root, 'vendor');
const vendorFile = path.join(vendorDir, 'zen-fs-config-ui.js');

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

function resolveVersion(arg) {
  if (arg) return arg.replace(/^v/, '');
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const dep = pkg.devDependencies?.['zen-fs-config-ui'];
  if (!dep) {
    fail('未指定版本，且 package.json 里没有 zen-fs-config-ui 依赖。用法: node scripts/update-vendor.mjs <version>');
  }
  return dep.replace(/^[^0-9]*/, '');
}

const version = resolveVersion(process.argv[2]);
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zfui-vendor-'));
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

try {
  console.log(`→ 下载 zen-fs-config-ui@${version} …`);
  // Windows 上 npm 是 .cmd，Node 不允许直接 spawn，需要走 shell
  const pack = spawnSync(npmCmd, ['pack', `zen-fs-config-ui@${version}`, '--silent', '--pack-destination', tmpDir], {
    cwd: tmpDir,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (pack.error) fail(`npm pack 失败: ${pack.error.message}`);
  if (pack.status !== 0) fail(`npm pack 退出码 ${pack.status}: ${pack.stderr || pack.stdout}`);

  const tgz = (await fsp.readdir(tmpDir)).find((f) => f.endsWith('.tgz'));
  if (!tgz) fail('npm pack 未生成 .tgz 文件');

  const tar = spawnSync('tar', ['-xzf', path.join(tmpDir, tgz), '-C', tmpDir], { encoding: 'utf8' });
  if (tar.error) fail(`解包失败（需要系统 tar）: ${tar.error.message}`);
  if (tar.status !== 0) fail(`tar 退出码 ${tar.status}: ${tar.stderr || tar.stdout}`);

  const pkgDir = path.join(tmpDir, 'package');
  const packedPkg = JSON.parse(await fsp.readFile(path.join(pkgDir, 'package.json'), 'utf8'));
  if (packedPkg.version !== version) {
    fail(`版本不一致: 请求 ${version}，包内为 ${packedPkg.version}`);
  }

  const src = path.join(pkgDir, 'dist', 'zen-fs-config-ui.js');
  const next = await fsp.readFile(src);
  let prevHash = '(无旧文件)';
  if (fs.existsSync(vendorFile)) {
    prevHash = sha256(await fsp.readFile(vendorFile));
  }

  await fsp.mkdir(vendorDir, { recursive: true });
  await fsp.copyFile(src, vendorFile);
  const nextHash = sha256(next);

  console.log(`✓ zen-fs-config-ui@${version}`);
  console.log(`  vendor 旧 SHA256: ${prevHash}`);
  console.log(`  vendor 新 SHA256: ${nextHash}`);
  console.log(`  已写入: ${vendorFile}`);
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
} finally {
  await fsp.rm(tmpDir, { recursive: true, force: true });
}
