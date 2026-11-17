#!/usr/bin/env node
// eval 실행에 이 플러그인의 의존성을 함께 싣기 위해, 설치된 의존성 플러그인을 .eval-deps/<이름>에 복사한다.
//
//   node scripts/link-eval-deps.mjs
//
// 왜 필요한가: `claude plugin eval`은 매번 빈 환경에서 돌아서 사용자에게 설치된 플러그인이 없다.
// plugin.json의 dependencies가 채워지지 않으면 이 플러그인 전체가 로드에 실패하고
// (plugin_errors: dependency-unsatisfied), 켠 쪽도 플러그인 없이 돈다.
// 각 케이스의 prompt.md는 `plugins: ["../..", "../../.eval-deps/<이름>"]`로 둘을 함께 싣는다.
// 링크가 아니라 복사인 이유: eval은 레포 밖으로 풀리는 플러그인 경로를 거부한다(containment root).

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(root, '.claude-plugin', 'plugin.json'), 'utf8'));
const dependencies = manifest.dependencies ?? [];

const installedFile = join(process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), '.claude'), 'plugins', 'installed_plugins.json');
if (!existsSync(installedFile)) {
  console.error(`설치 목록이 없습니다: ${installedFile}`);
  process.exit(1);
}
const installed = JSON.parse(readFileSync(installedFile, 'utf8'));
const installedPlugins = installed.plugins ?? installed;

const depsDir = join(root, '.eval-deps');
mkdirSync(depsDir, { recursive: true });

let missing = 0;
for (const dependency of dependencies) {
  const id = `${dependency.name}@${dependency.marketplace}`;
  const installPath = installedPlugins[id]?.[0]?.installPath;
  if (!installPath || !existsSync(installPath)) {
    console.error(`설치되지 않음: ${id} → claude plugin install ${id}`);
    missing += 1;
    continue;
  }
  const target = join(depsDir, dependency.name);
  rmSync(target, { recursive: true, force: true });
  cpSync(installPath, target, {
    recursive: true,
    filter: (source) => !source.split(/[\\/]/).includes('node_modules') && !source.split(/[\\/]/).includes('.git'),
  });
  console.log(`${dependency.name} → ${installPath}`);
}

if (missing > 0) process.exit(1);
console.log(`의존성 ${dependencies.length}개를 .eval-deps/에 복사했습니다.`);
