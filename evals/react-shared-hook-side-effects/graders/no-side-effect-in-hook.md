---
# useCancelOrder 정의부터 그 함수가 끝나는 줄(맨 앞의 `}`) 사이에 navigate·toast가 있으면 탈락
type: regex
pattern: '(function\s+useCancelOrder\b|const\s+useCancelOrder\s*=)(?:(?!\n\}|\n\);)[\s\S])*?\b(useNavigate|navigate\s*\(|toast\s*\()'
match: not_contains
---
