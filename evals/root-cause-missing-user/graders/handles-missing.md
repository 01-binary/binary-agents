---
# 구매자가 없을 때의 분기나 표시가 있어야 한다: if (!buyer), buyer ? ... : ..., buyer?.name ?? '...'
type: regex
pattern: 'if\s*\(\s*!\s*buyer\b|buyer\s*={2,3}\s*(undefined|null)|!buyer\s*\?|\bbuyer\s*\?\s*[(\w]|buyer\?\.\w+\s*\?\?\s*[''"`]'
---
