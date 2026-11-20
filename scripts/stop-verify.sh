#!/usr/bin/env bash
# Stop: typecheck + test 가 깨져 있으면 exit 2 로 Claude를 되돌린다.
# - 되돌린 뒤(stop_hook_active=true)에도 다시 검사한다. 한 체인에서 최대 2번만 되돌리고, 그래도 실패면 통과시키되 사용자에게 경고(systemMessage)를 띄운다
# - subagent·workflow·teammate 가 아직 작업 중이면 통과. dev 서버 같은 shell·monitor 등 그 밖의 백그라운드 작업은 세지 않는다
# - JS/TS 프로젝트가 아니면 통과
# - 실패 로그는 마지막 40줄만 stderr 로
set -u
input="$(cat)"
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false')"
# 되돌림 횟수는 세션별 파일에 적는다. 이 훅 때문에 계속 중이 아니면 새 체인이므로 0부터 다시 센다
max_blocks=2
sid="$(printf '%s' "$input" | jq -r '.session_id // empty' | tr -cd 'A-Za-z0-9._-')"
count_file="${TMPDIR:-/tmp}/binary-agents-stop-verify-${sid:-nosession}"
[ "$active" = "true" ] || rm -f "$count_file" 2>/dev/null
# 이 작업 폴더를 아직 고치고 있을 수 있는 작업만 센다. dev 서버 같은 shell·monitor 등 그 밖의 타입은 게이트를 끄지 않는다
bg="$(printf '%s' "$input" | jq -r '[(.background_tasks // []) | arrays | .[] | objects | select(.type == "subagent" or .type == "workflow" or .type == "teammate")] | length')"
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

log="$(mktemp)"; fail=0; label="typecheck/test"

# turbo.json 에 정의된 태스크인지. 없는 태스크를 넘기면 turbo 가 "Could not find task" 로 실패해 검사 실패로 오인한다
# turbo.json 은 주석을 허용해 jq 로 못 읽을 수 있으므로 키 이름으로 찾는다
has_turbo_task() { grep -Eq "\"$1\"[[:space:]]*:" turbo.json; }

# turbo 모노레포면 HEAD 대비 바뀐 패키지(커밋 안 한 변경 포함)만 검사한다 — 전체 앱을 돌리면 느리고 상관없는 앱 실패에 걸린다
if [ -f turbo.json ]; then
  # 타입 검사 태스크 이름은 레포마다 다르다 (check-types, typecheck, type-check)
  turbo_tasks=""
  for t in check-types typecheck type-check; do
    if has_turbo_task "$t"; then turbo_tasks="$t"; break; fi
  done
  has_turbo_task test && turbo_tasks="${turbo_tasks:+$turbo_tasks }test"
  [ -z "$turbo_tasks" ] && { rm -f "$log"; exit 0; }
  label="바뀐 패키지의 ${turbo_tasks// //}"
  # shellcheck disable=SC2086 # 태스크 이름은 공백으로 나눠 넘긴다
  npx turbo run $turbo_tasks --filter='[HEAD]' >"$log" 2>&1 || fail=1
else
  if has_script typecheck; then
    $run typecheck >"$log" 2>&1 || fail=1
  elif [ -f tsconfig.json ] && [ -x node_modules/.bin/tsc ]; then
    node_modules/.bin/tsc --noEmit -p tsconfig.json >"$log" 2>&1 || fail=1
  fi

  if [ $fail -eq 0 ] && has_script test; then
    CI=1 $run test >"$log" 2>&1 || fail=1
  fi
fi

if [ $fail -eq 0 ]; then
  rm -f "$log" "$count_file"; exit 0
fi

# 더 붙잡지 않고 통과시키되, 아직 실패 중이라는 걸 사용자 화면에 띄운다 (exit 0 + stdout JSON 의 systemMessage)
warn_pass() {
  msg="[binary-agents stop-verify] ${label} 가 아직 실패 중입니다. 되돌려도 고쳐지지 않아 여기서 턴을 끝냅니다. 마지막 10줄:
$(tail -n 10 "$log")"
  rm -f "$log"
  jq -cn --arg m "$msg" '{systemMessage: $m}'
  exit 0
}

n=0
[ -f "$count_file" ] && n="$(cat "$count_file" 2>/dev/null)"
case "$n" in ''|*[!0-9]*) n=0 ;; esac
[ "$n" -ge "$max_blocks" ] && warn_pass
# 횟수를 적지 못하면 끝없이 되돌릴 수 있으니, 이미 되돌려진 상태에서는 경고만 하고 통과시킨다
if ! { printf '%s\n' "$((n + 1))" >"$count_file"; } 2>/dev/null; then
  [ "$active" = "true" ] && warn_pass
fi

{
  echo "[binary-agents stop-verify] ${label} 실패. 고치고 다시 끝내라 (되돌림 $((n + 1))/${max_blocks}). 마지막 40줄:"
  tail -n 40 "$log"
} >&2
rm -f "$log"; exit 2
