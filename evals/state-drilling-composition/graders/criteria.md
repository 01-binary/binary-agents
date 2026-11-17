---
type: llm
---

PASS if 컴포넌트 합성으로 정리한다. `DashboardPage`(또는 `user`를 가진 곳)가 `<UserMenu user={user} />`를 직접 만들어 `children`이나 슬롯 prop(`userMenu`·`sidebarFooter` 등)으로 `Layout`·`Sidebar`에 넘겨서, 중간 컴포넌트가 `user`를 몰라도 되게 한다.

FAIL if `user`를 위해 새 Context(`createContext`)나 전역 스토어(Zustand·Redux·Jotai 등)를 만든다. 넓게 퍼지지도 않고 한 곳에서만 쓰는 값이라 합성으로 풀 수 있다.

`UserMenu` 안에서 `useSuspenseQuery({ queryKey: ['me'] })`로 직접 가져오게 바꾸는 것도 PASS다(서버 상태 캐시를 쓰는 방식).

변수 이름, 슬롯 prop 이름, 코드 스타일, 설명의 길이는 판정에 쓰지 않는다.
