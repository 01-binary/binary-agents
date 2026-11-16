---
# 비인터랙티브 요소의 여는 태그 안에 onClick이 있으면 탈락
type: regex
pattern: '<(div|span|li|article|section)\b[^>]*\bonClick'
match: not_contains
---
