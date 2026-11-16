---
# useEffect 안에서 직접 가져오거나 로딩 여부를 setState로 관리하면 탈락.
# examples.md의 "useEffect.*fetch"는 줄 단위라 여러 줄에 걸친 코드를 못 잡아서 [\s\S]로 바꿨다
type: regex
pattern: 'useEffect\s*\([\s\S]{0,300}?fetchRecentOrders|\bset(Is)?\w*Loading\b'
match: not_contains
---
