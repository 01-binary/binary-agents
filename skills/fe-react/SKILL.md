---
name: fe-react
description: React 컴포넌트를 설계하거나 리뷰할 때 쓰는 패턴 기준. 컴포넌트가 데이터를 직접 가져올지 페이지가 내려줄지, 부수효과를 함수 안에 둘지, 데이터 fetching과 Suspense·에러 경계를 어디에 둘지, 컴포넌트·함수·훅·불리언 이름을 지을 때, memo·useMemo·useCallback을 쓸지 정할 때 사용
---

# React 컴포넌트 패턴

- **"내부에서 뭘 하는지 모른다"는 것 자체가 문제가 아님**: 추상화된 역할이 이름으로 명확한지가 중요
- **측정 후 최적화**: 메모이제이션은 실제 성능 문제 확인 후 적용
- **트레이드오프 인식**: 응집도와 명시성, 결합도와 응집도는 상충할 수 있음
- **일관성 > 완벽함**: 팀 전체 일관성이 개인 최적화보다 중요
- **점진적 개선**: 전체 재작성이 아닌 단계적 개선 추천

## 빠른 참조

| 영역 | 이런 코드면 의심 | 개선 방향 |
|---|---|---|
| 컴포넌트 데이터 소유 | 페이지가 모든 데이터를 가져와 props로 내려준다. 같은 역할의 컴포넌트마다 방식이 다르다 | 재사용성과 변경 영향을 기준으로 응집도 우선과 명시성 우선 중 하나를 골라 일관되게 쓴다 |
| 부수효과 위치 | 선택적이거나 호출처마다 다른 부수효과(알림, 페이지 이동)가 함수 안에 고정돼 있다 | 호출하는 쪽으로 꺼낸다. 항상 발생하고 주 동작의 일부면 안에 둬도 된다 |
| 데이터 fetching | 순차 `await`로 차례차례 가져온다. 부모 데이터가 온 뒤에야 렌더되는 자식이 또 가져온다(중첩 waterfall). 한 컴포넌트에서 `useSuspenseQuery`를 여러 번 쓴다 | 형제 컴포넌트끼리는 각자 가져와도 병렬로 실행된다. 중첩이면 쿼리를 위로 끌어올리거나 미리 가져오고(prefetch), 한 컴포넌트의 여러 Suspense 쿼리는 `useSuspenseQueries`로 묶는다 |
| 비동기 경계 | Suspense만 있고 에러 경계가 없다. `useSuspenseQuery`를 경계 없이 쓴다 | Suspense와 ErrorBoundary를 함께(AsyncBoundary) 두고, 즉시 그릴 영역은 경계 밖에 둔다 |
| 네이밍 | `data`, `info`, 대상이 없는 `handle`(`handleData`) 같은 모호한 이름, `is`/`has`가 없는 불리언, 훅 이름의 `fetch`/`get` | 역할이 드러나는 이름, `is`/`has`/`can`/`should`, 훅은 목적으로 (`useProductList`) |
| 메모이제이션 | 측정 없이 붙인 `memo`·`useMemo`, memo 컴포넌트에 넘기는 인라인 객체·함수 | 측정한 뒤 필요할 때만, 안정적인 참조로 넘긴다. React Compiler를 쓰면 대부분 필요 없다 |
| props를 state로 복사 | `useState(props.isOpen)`처럼 받은 props를 state로 복사 | props를 그대로 쓰는 controlled 컴포넌트로. 초기값만 쓰고 이후 변경을 일부러 무시한다면 `initialOpen`·`defaultOpen`처럼 이름으로 드러낸다 |

## 판단 기준

### 응집도 우선 vs 명시성 우선

응집도 우선은 컴포넌트가 필요한 데이터를 직접 가져오고(`<UserProfile />`), 명시성 우선은 페이지가 가져와 props로 내려준다(`<UserProfile user={user} />`).

| 기준             | 응집도 우선               | 명시성 우선                 |
| ---------------- | ------------------------- | --------------------------- |
| 재사용성         | 컴포넌트만 가져다 쓰면 됨 | 매번 상태 + props 연결 필요 |
| 변경 영향        | 해당 컴포넌트만 수정      | 페이지 + 모든 사용처 수정   |
| 데이터 흐름 파악 | 컴포넌트 내부로 이동 필요 | 페이지에서 바로 확인        |
| 테스트           | 데이터 계층(네트워크, QueryClient)을 흉내 내야 함 | props만 넣으면 되어 단위 테스트가 쉬움 |
| 요청 waterfall   | 컴포넌트가 중첩되면 생기기 쉬움 | 상위에서 한 번에 가져와 피하기 쉬움 |

### 부수효과를 함수 안에 둬도 되는 조건

**내부에서 관리해도 되는 조건** (3가지 모두 충족 시):

1. 부수효과가 **항상 발생**해야 함
2. 부수효과가 **주 동작과 논리적으로 하나**임
3. 호출하는 쪽에서 **제어할 필요 없음**

**분리해야 하는 조건** (하나라도 해당 시):

- 부수효과가 **선택적**임
- 호출처마다 **정책이 다를 수 있음**
- 테스트에서 **제외/대체 필요**

| 상황      | 부수효과              | 판단    | 이유                      |
| --------- | --------------------- | ------- | ------------------------- |
| 로그인    | 마지막 접속 시간 저장 | 내부 OK | 항상 발생, 로그인의 일부  |
| 폼 제출   | 성공 토스트 표시      | 내부 OK | 항상 발생, UX의 일부      |
| 주문 완료 | 이메일 발송           | 분리    | 사용자 설정에 따라 다름   |
| 버튼 클릭 | 페이지 이동           | 분리    | 이동 경로가 상황마다 다름 |

위 표의 "내부 OK"는 그 화면의 이벤트 핸들러 안일 때다. 여러 곳에서 쓰는 함수나 훅(예: mutation 훅) 안이라면 호출처마다 원하는 게 다를 수 있으므로, 토스트·페이지 이동 같은 부수효과는 호출하는 쪽에 둔다.

### 메모이제이션 적용 판단

React Compiler를 쓰는 프로젝트라면 컴파일러가 값과 함수를 자동으로 메모이제이션하므로 `memo`·`useMemo`·`useCallback`을 손으로 붙일 일이 거의 없다. 아래 기준은 컴파일러를 쓰지 않을 때 적용한다.

| 상황                               | memo 필요? | 이유                             |
| ---------------------------------- | ---------- | -------------------------------- |
| 리스트에서 반복 렌더링되는 아이템  | 고려       | 일부만 변경 시 효과적            |
| props가 primitive 값으로 안정적    | 고려       | 비교 비용 낮고 효과 있음         |
| props가 매번 새로운 객체/함수      | 불필요     | 비교만 하고 항상 리렌더링        |
| 렌더링 비용이 낮은 간단한 컴포넌트 | 불필요     | 최적화 이득이 거의 없음          |
| 부모가 자주 리렌더링되지 않음      | 불필요     | 문제가 없는데 최적화할 필요 없음 |

### 함수 이름 접두사

| 접두사          | 용도                           | 예시                                   |
| --------------- | ------------------------------ | -------------------------------------- |
| `get`           | 값을 계산/반환 (부수효과 없음) | `getFullName()`, `getTotalPrice()`     |
| `fetch`         | 외부에서 데이터 가져옴         | `fetchUserProfile()`, `fetchOrders()`  |
| `create`        | 새로운 것을 생성               | `createOrder()`, `createComment()`     |
| `update`        | 기존 것을 수정                 | `updateUserInfo()`, `updateCartItem()` |
| `delete/remove` | 삭제                           | `deleteComment()`, `removeFromCart()`  |
| `handle`        | 이벤트 처리                    | `handleSubmit()`, `handleClick()`      |
| `validate`      | 검증                           | `validateEmail()`, `validateForm()`    |
| `format`        | 형식 변환                      | `formatDate()`, `formatCurrency()`     |
| `parse`         | 문자열->구조화된 데이터        | `parseJSON()`, `parseQueryString()`    |
| `serialize`     | 구조화된 데이터->문자열        | `serializeFormData()`                  |

훅 이름에는 데이터를 어떻게 가져오는지(`fetch`, `get`)를 넣지 않고 무엇을 주는지만 쓴다(`useUserProfile`). API를 직접 호출하는 함수만 `fetchUserProfile`처럼 `fetch`를 쓴다.

## Red Flags (발견 즉시 Critical)

- **Props → State 복사**: 동기화 문제 발생 가능 (초기값 전용이면 `initial`·`default`로 시작하는 이름으로 드러낼 것)
- **Waterfall Fetch**: 순차 await, 중첩 컴포넌트의 연쇄 fetch, 한 컴포넌트의 여러 `useSuspenseQuery`로 인한 성능 저하
- **AsyncBoundary 누락**: useSuspenseQuery 사용 시 ErrorBoundary 없음
- **모호한 네이밍**: `data`, `info`, 대상이 없는 `handle`(`handleData`) 등 범용 이름
- **memo + 인라인 객체/함수**: 무의미한 메모이제이션

God Hook, Props Drilling은 `fe-coupling`, 숨은 부수효과는 `fe-predictability`, 상태 위치는 `fe-state` 기준을 따른다.

## 다른 원칙과 부딪히는 지점

- **응집도 우선 vs 명시성 우선**: 응집도 우선은 데이터 흐름이 컴포넌트 안으로 들어가 페이지에서 바로 안 보인다. 이름이 역할을 드러내면 문제가 아니지만, 컴포넌트가 중첩되면 요청 waterfall이 생길 수 있다는 비용은 함께 따진다.
- **Props Drilling**: `fe-coupling`과 같은 순서로 푼다. 컴포넌트 합성을 먼저 시도하고, Context는 최후 수단이다.
- **부수효과를 안에 두기**: `fe-predictability`의 "숨은 로직 드러내기"의 예외다. 위 세 조건을 모두 만족할 때만 안에 둔다.
- 원칙끼리 부딪히면 `fe-tradeoffs` 스킬의 판단 기준을 따른다.

## 예시 코드

영역별 상세 설명, Bad/Good 코드, 판단 표, 확인 질문은 [references/examples.md](references/examples.md)에 있다.

## 출처

- React 개발 원칙 문서 (react-development-principles.md)
- [Toss Frontend Fundamentals](https://frontend-fundamentals.com/code-quality/code/)
- [React Official Docs](https://react.dev)
