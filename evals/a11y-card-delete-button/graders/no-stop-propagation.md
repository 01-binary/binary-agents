---
# 이벤트 전파·기본 동작을 막아서 중첩을 덮으면 탈락
type: regex
pattern: '\.(stopPropagation|preventDefault)\s*\('
match: not_contains
---
