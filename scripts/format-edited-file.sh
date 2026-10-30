#!/usr/bin/env bash
# PostToolUse(Edit|Write): 방금 편집한 파일 하나만 prettier → eslint --fix.
# 항상 exit 0. 포맷 실패는 세션을 막지 않는다 (Stop 게이트가 잡는다).
set -u
input="$(cat)"
file="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')"
cwd="$(printf '%s' "$input" | jq -r '.cwd // empty')"
[ -n "$file" ] && [ -f "$file" ] || exit 0
[ -n "$cwd" ] && cd "$cwd" || exit 0
[ -f package.json ] || exit 0

case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.css|*.scss|*.json|*.md|*.mdx|*.html|*.yml|*.yaml) ;;
  *) exit 0 ;;
esac

bin=node_modules/.bin
[ -x "$bin/prettier" ] && "$bin/prettier" --write --log-level silent "$file" >/dev/null 2>&1

case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs)
    [ -x "$bin/eslint" ] && "$bin/eslint" --fix --no-warn-ignored "$file" >/dev/null 2>&1
    ;;
esac
exit 0
