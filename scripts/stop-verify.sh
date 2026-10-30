#!/usr/bin/env bash
# Stop: typecheck + test 가 깨져 있으면 exit 2 로 Claude를 되돌린다.
# - stop_hook_active=true (이미 이 훅 때문에 계속 중) 이면 무한루프 방지로 통과
# - JS/TS 프로젝트가 아니면 통과
# - 실패 로그는 마지막 40줄만 stderr 로
set -u
input="$(cat)"
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false')"
[ "$active" = "true" ] && exit 0
bg="$(printf '%s' "$input" | jq -r '(.background_tasks // []) | length')"
[ "$bg" != "0" ] && exit 0
cwd="$(printf '%s' "$input" | jq -r '.cwd // empty')"
[ -n "$cwd" ] && cd "$cwd" || exit 0
[ -f package.json ] || exit 0

# 변경이 없으면 검사할 게 없다
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  [ -z "$(git status --porcelain 2>/dev/null)" ] && exit 0
fi

if   [ -f pnpm-lock.yaml ]; then run="pnpm"
elif [ -f yarn.lock ];      then run="yarn"
elif [ -f bun.lockb ] || [ -f bun.lock ]; then run="bun"
else run="npm run"; fi

has_script() { jq -e --arg s "$1" '.scripts[$s] // empty' package.json >/dev/null 2>&1; }

log="$(mktemp)"; fail=0

if has_script typecheck; then
  $run typecheck >"$log" 2>&1 || fail=1
elif [ -f tsconfig.json ] && [ -x node_modules/.bin/tsc ]; then
  node_modules/.bin/tsc --noEmit -p tsconfig.json >"$log" 2>&1 || fail=1
fi

if [ $fail -eq 0 ] && has_script test; then
  CI=1 $run test >"$log" 2>&1 || fail=1
fi

if [ $fail -ne 0 ]; then
  {
    echo "[binary-agents stop-verify] typecheck/test 실패. 고치고 다시 끝내라. 마지막 40줄:"
    tail -n 40 "$log"
  } >&2
  rm -f "$log"; exit 2
fi
rm -f "$log"; exit 0
