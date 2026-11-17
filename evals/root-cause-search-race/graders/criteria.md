---
type: llm
---

PASS if 이미 출발한 이전 요청의 응답이 나중 검색어의 결과를 덮어쓰지 못하게 한다. 방법은 `AbortController`로 이전 요청 취소, effect cleanup에서 켜는 무시 플래그(`ignore`·`cancelled`), 요청 번호 비교, TanStack Query 같은 서버 상태 도구 중 무엇이든 된다. 디바운스는 같이 둬도 된다.

FAIL if 디바운스(타이머)만 추가해서 끝낸다. 디바운스는 대기 중인 타이머만 취소할 뿐 이미 출발한 요청의 응답 순서는 그대로다.

FAIL if `fetch` 응답의 `res.ok`(또는 status)를 확인하지 않아서 4xx·5xx 응답이 결과로 처리된다.

변수 이름, 디바운스 시간, 코드 스타일, 설명의 길이는 판정에 쓰지 않는다.
