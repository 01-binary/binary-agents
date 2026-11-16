#!/usr/bin/env node
// eval 케이스의 regex 채점기를 정답지(reference/good.*, reference/bad.*)에 대본다. 모델 호출 없음.
//
//   node scripts/check-eval-graders.mjs
//
// 통과 조건
// 1. 모든 regex 채점기가 good을 통과시킨다 (맞는 답을 떨어뜨리면 기준이 좁은 것)
// 2. 케이스마다 bad를 떨어뜨리는 regex 채점기가 하나 이상 있다 (틀린 답을 못 잡으면 기준이 넓은 것)
//
// llm·tool_used 채점기는 실제 실행이 있어야 해서 여기서 다루지 않는다.
// 판정 방식은 `claude plugin eval`의 regex 채점기와 같다: 기본은 "패턴이 있으면 통과",
// match: not_contains 는 "없으면 통과", match: "count:N" 은 "정확히 N번이면 통과".

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const evalDir = join(root, 'evals');

function unquote(raw) {
  const value = raw.trim();
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).replace(/''/g, "'");
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/\\(["\\])/g, '$1');
  }
  return value;
}

function readFrontmatter(file) {
  const text = readFileSync(file, 'utf8');
  const found = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!found) return {};
  const fields = {};
  for (const line of found[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    fields[line.slice(0, colon).trim()] = unquote(line.slice(colon + 1));
  }
  return fields;
}

function passes(grader, text) {
  const flags = grader.flags ?? '';
  const match = grader.match ?? 'contains';
  if (match === 'not_contains') return !new RegExp(grader.pattern, flags).test(text);
  const count = /^count:(\d+)$/.exec(match);
  if (count) {
    const all = new RegExp(grader.pattern, flags.includes('g') ? flags : `${flags}g`);
    return (text.match(all) ?? []).length === Number(count[1]);
  }
  return new RegExp(grader.pattern, flags).test(text);
}

function findReference(caseDir, name) {
  const dir = join(caseDir, 'reference');
  if (!existsSync(dir)) return null;
  const file = readdirSync(dir).find((entry) => entry.startsWith(`${name}.`));
  return file ? readFileSync(join(dir, file), 'utf8') : null;
}

const label = (ok) => (ok ? '통과' : '탈락');
const problems = [];
let checked = 0;

if (!existsSync(evalDir)) {
  console.error('evals/ 폴더가 없습니다.');
  process.exit(1);
}

for (const caseName of readdirSync(evalDir).sort()) {
  const caseDir = join(evalDir, caseName);
  const gradersDir = join(caseDir, 'graders');
  if (!statSync(caseDir).isDirectory() || !existsSync(gradersDir)) continue;

  const graders = readdirSync(gradersDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => ({ name: file.replace(/\.md$/, ''), ...readFrontmatter(join(gradersDir, file)) }))
    .filter((grader) => grader.type === 'regex');
  if (graders.length === 0) continue;

  const good = findReference(caseDir, 'good');
  const bad = findReference(caseDir, 'bad');
  if (good === null || bad === null) {
    problems.push(`${caseName}: reference/good.* 와 reference/bad.* 가 둘 다 있어야 합니다`);
    continue;
  }

  console.log(caseName);
  let catchesBad = false;
  for (const grader of graders) {
    if (!grader.pattern) {
      problems.push(`${caseName}/${grader.name}: frontmatter에 pattern이 없습니다`);
      continue;
    }
    const goodPasses = passes(grader, good);
    const badPasses = passes(grader, bad);
    checked += 1;
    console.log(`  ${grader.name}: good ${label(goodPasses)}, bad ${label(badPasses)}`);
    if (!goodPasses) problems.push(`${caseName}/${grader.name}: 정답(good)을 떨어뜨립니다. 기준이 좁습니다`);
    if (!badPasses) catchesBad = true;
  }
  if (!catchesBad) problems.push(`${caseName}: 오답(bad)을 떨어뜨리는 regex 채점기가 없습니다. 기준이 넓습니다`);
}

console.log('');
if (problems.length > 0) {
  console.log(`문제 ${problems.length}건`);
  for (const problem of problems) console.log(`  - ${problem}`);
  process.exit(1);
}
console.log(`regex 채점기 ${checked}개 모두 정상: good은 통과시키고, 케이스마다 bad를 떨어뜨립니다.`);
