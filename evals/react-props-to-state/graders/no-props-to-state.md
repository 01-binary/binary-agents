---
# useState(isOpen), useState<boolean>(props.isOpen) 처럼 props를 state의 초기값으로 복사하면 탈락
type: regex
pattern: 'useState\s*(?:<[^>]*>)?\s*\(\s*(?:props\.)?isOpen\s*\)'
match: not_contains
---
