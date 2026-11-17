---
# <Link>나 <a> 여는 태그 뒤, 닫기 전에 버튼이 나오면 탈락 (인터랙티브 요소 중첩)
type: regex
pattern: '<(Link|a)\b[^>]*>(?:(?!</(?:Link|a)>)[\s\S])*<(?:button|Button|IconButton)\b'
match: not_contains
---
