---
type: llm
---

PASS if 쿠폰 모달의 열림 여부를 `CartPage` 안의 로컬 상태(`useState` 등)로 둔다.

FAIL if 모달 열림 여부를 전역 스토어(`cartStore`)에 추가하거나, 새 Context나 새 스토어를 만들어 넣는다.

변수 이름, 코드 스타일, 설명의 길이, 버튼의 생김새는 판정에 쓰지 않는다.
