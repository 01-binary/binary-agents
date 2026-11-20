#!/usr/bin/env bash
# SessionStart: promote 할 때가 됐으면 한 줄 제안을 컨텍스트에 넣는다.
# 조건: 마지막 promote 후 14일 경과  그리고  그 뒤 새로 쌓인 지적(auto memory 의 feedback 메모리)이 1개 이상
# worktree 도 메인 레포와 같은 날짜·메모리를 본다 — auto memory 가 메인 레포 폴더 하나에 쌓이기 때문
set -u
input="$(cat)"
cwd="$(printf '%s' "$input" | jq -r '.cwd // empty')"
[ -n "$cwd" ] && cd "$cwd" || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
[ -f package.json ] || exit 0

main_root="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")"
marker="$HOME/.claude/binary-agents/last-promote$(printf '%s' "$main_root" | tr '/' '_')"
memory_dir="$HOME/.claude/projects/$(printf '%s' "$main_root" | sed 's/[^A-Za-z0-9]/-/g')/memory"
mkdir -p "$HOME/.claude/binary-agents"

# 처음이면 30일 전으로 시작한다 — 쌓인 지적이 있으면 바로 제안
if [ -f "$marker" ]; then since="$(cat "$marker")"; else since="$(date -v-30d +%F 2>/dev/null || date -d '30 days ago' +%F)"; echo "$since" > "$marker"; fi

days=$(( ( $(date +%s) - $(date -j -f %F "$since" +%s 2>/dev/null || date -d "$since" +%s) ) / 86400 ))
feedbacks=0
if [ -d "$memory_dir" ]; then
  feedbacks=$(find "$memory_dir" -name '*.md' -newermt "$since" -exec grep -l '^[[:space:]]*type:[[:space:]]*feedback' {} + 2>/dev/null | wc -l | tr -d ' ')
fi

if [ "$days" -ge 14 ] && [ "$feedbacks" -ge 1 ]; then
  echo "[binary-agents] 마지막 promote 후 ${days}일, 그 뒤 쌓인 지적(feedback 메모리) ${feedbacks}개. 사용자에게 먼저 한 줄로 '/binary-agents:promote 돌릴까?' 라고 제안하라 (작업 요청이 급하면 작업 먼저). 거절하면 이 세션에선 다시 묻지 않는다."
fi
exit 0
