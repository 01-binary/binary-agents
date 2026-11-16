---
type: llm
---

PASS if 최근 주문을 TanStack Query(`useQuery`, `useSuspenseQuery` 등) 같은 서버 상태 도구로 가져오고, 로딩·실패 표시를 그 도구가 주는 상태나 Suspense·ErrorBoundary로 처리한다.

FAIL if `useState`와 `useEffect`로 직접 가져오거나, 로딩·에러 여부를 `useState`로 따로 관리한다.

변수 이름, 코드 스타일, 설명의 길이, 목록의 마크업은 판정에 쓰지 않는다.
