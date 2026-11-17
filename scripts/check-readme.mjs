#!/usr/bin/env node
// skills/·agents/에 있는 이름이 README에 모두 나오는지 확인한다. 스킬·에이전트를 추가·삭제한 뒤 문서를 따로 맞추는 커밋이 반복돼서 만들었다.
//
//   node scripts/check-readme.mjs

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readme = readFileSync(join(root, 'README.md'), 'utf8');

const skills = readdirSync(join(root, 'skills')).filter((name) => statSync(join(root, 'skills', name)).isDirectory());
const agents = readdirSync(join(root, 'agents')).filter((file) => file.endsWith('.md')).map((file) => file.replace(/\.md$/, ''));

const missing = [
  ...skills.filter((name) => !readme.includes(`\`${name}\``) && !readme.includes(`/binary-agents:${name}`)).map((name) => `skill ${name}`),
  ...agents.filter((name) => !readme.includes(`\`${name}\``)).map((name) => `agent ${name}`),
];

if (missing.length > 0) {
  console.log(`README에 없는 항목 ${missing.length}개`);
  for (const item of missing) console.log(`  - ${item}`);
  process.exit(1);
}
console.log(`README가 스킬 ${skills.length}개, 에이전트 ${agents.length}개를 모두 언급합니다.`);
