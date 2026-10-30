#!/usr/bin/env bash
# SessionStart: promote 할 때가 됐으면 한 줄 제안을 컨텍스트에 넣는다.
# 조건: 마지막 promote 후 21일 경과  또는  교정성 커밋(fix/revert/리뷰 반영) 5개 이상
set -u
input="$(cat)"
cwd="$(printf '%s' "$input" | jq -r '.cwd // empty')"
[ -n "$cwd" ] && cd "$cwd" || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
[ -f package.json ] || exit 0

key="$(git rev-parse --show-toplevel | tr '/' '_')"
marker="$HOME/.claude/binary-agents/last-promote$key"
mkdir -p "$HOME/.claude/binary-agents"

if [ -f "$marker" ]; then since="$(cat "$marker")"; else since="$(date -v-30d +%F 2>/dev/null || date -d '30 days ago' +%F)"; echo "$since" > "$marker"; fi

days=$(( ( $(date +%s) - $(date -j -f %F "$since" +%s 2>/dev/null || date -d "$since" +%s) ) / 86400 ))
fixes=$(git log --since="$since" --oneline -i -E --grep='fix|revert|리뷰 반영|수정|hotfix' 2>/dev/null | wc -l | tr -d ' ')

if [ "$days" -ge 21 ] || [ "$fixes" -ge 5 ]; then
  echo "[binary-agents] 마지막 promote 후 ${days}일, 교정성 커밋 ${fixes}개. 사용자에게 먼저 한 줄로 '/binary-agents:promote 돌릴까?' 라고 제안하라 (작업 요청이 급하면 작업 먼저). 거절하면 이 세션에선 다시 묻지 않는다."
fi
exit 0
