---
# non-null 단언(`)!`·`buyer!`), as 단언, 빈 객체 폴백이 있으면 탈락
# 바로 뒤에 백틱이 오면 설명 문장 속 언급("`as User` 대신 …")이라 코드로 보지 않는다
type: regex
pattern: '(?:(\)|\bbuyer)!(?!=)|\bas\s+User\b|(\|\||\?\?)\s*\{\s*\})(?!`)'
match: not_contains
---
