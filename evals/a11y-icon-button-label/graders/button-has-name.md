---
# 버튼의 여는 태그 안에 aria-label(ledby)이 있거나, 시각적으로 숨긴 텍스트가 있어야 한다.
# 다이얼로그 div의 aria-labelledby에 걸리지 않게 <button 태그 안으로 한정했고, onClick의 => 를 태그 끝으로 착각하지 않게 했다
type: regex
pattern: '<(?:button|Button|IconButton)\b(?:=>|[^>])*?\baria-label(?:ledby)?\s*=|sr-only|visually-hidden|VisuallyHidden|ScreenReaderOnly'
---
