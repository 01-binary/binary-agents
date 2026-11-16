---
type: llm
---

PASS if 열림 여부는 계속 부모가 갖고, `Drawer`는 `onClose` 같은 콜백 props를 받아 닫기 버튼에서 호출한다.

FAIL if `isOpen` props를 `useState`로 복사해 `Drawer` 안에서 따로 관리한다. 이러면 부모의 값과 어긋날 수 있다.

변수 이름, 코드 스타일, 설명의 길이, 버튼의 생김새는 판정에 쓰지 않는다.
