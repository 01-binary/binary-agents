---
# non-null 단언(`)!`·`buyer!`), as 단언, 빈 객체 폴백이 있으면 탈락
type: regex
pattern: '(\)|\bbuyer)!(?!=)|\bas\s+User\b|(\|\||\?\?)\s*\{\s*\}'
match: not_contains
---
