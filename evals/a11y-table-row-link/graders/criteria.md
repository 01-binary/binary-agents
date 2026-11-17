---
type: llm
---

PASS if 각 행 안에 실제 링크(`<Link>`·`<a>`)가 있어서 키보드 포커스와 새 탭 열기가 되고, 가상 요소(`::after`)나 셀마다 링크를 두는 방식으로 행 어디를 눌러도 이동한다.

FAIL if `<tr>`에 `onClick`과 `navigate`(또는 `history.push`)만 붙인다. `tabIndex`·`role="link"`·`onKeyDown`을 덧붙여 흉내 내는 경우도 FAIL이다.

변수 이름, 코드 스타일, CSS 방식, 설명의 길이는 판정에 쓰지 않는다.
