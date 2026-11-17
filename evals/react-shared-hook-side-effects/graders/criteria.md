---
type: llm
---

PASS if `useCancelOrder` 훅은 취소 API 호출과 주문 목록 쿼리 무효화(`invalidateQueries`)처럼 어디서 쓰든 항상 필요한 일만 하고, 토스트와 `/orders` 이동은 `OrderDetailPage`의 호출부(예: `mutate(orderId, { onSuccess })`)에 둔다.

FAIL if 토스트나 페이지 이동(`useNavigate`·`navigate`)을 `useCancelOrder` 훅 안에 고정한다. 이 훅은 목록 페이지에서도 쓰므로, 목록에서 취소해도 다시 목록으로 이동하거나 원치 않는 토스트가 뜬다. 옵션 플래그(`redirect: true` 등)로 켜고 끄게 만든 경우도 FAIL이다.

변수 이름, 코드 스타일, 설명의 길이는 판정에 쓰지 않는다.
