# React 컴포넌트 패턴 예시

`fe-react` 스킬의 영역별 상세 설명, Bad/Good 코드, 판단 표, 확인 질문(🔍)입니다.

### 1. 응집도 vs 명시성 패턴 검토

컴포넌트 설계에서 응집도와 명시성 사이의 선택을 평가합니다.

**응집도 우선**: 컴포넌트가 내부에서 필요한 상태/데이터를 직접 관리

```tsx
// 페이지는 "무엇"만 선언
<UserProfile />          // 내부에서 사용자 데이터 fetch
<NotificationBell />     // 내부에서 알림 상태 관리
<ShoppingCart />         // 내부에서 장바구니 데이터 fetch
```

**명시성 우선**: 상위에서 모든 상태를 관리하고 props로 전달

```tsx
// 페이지에서 "어떻게"도 보임
const { data: user } = useQuery(userQuery);
const { data: notifications } = useQuery(notificationQuery);

<UserProfile user={user} />
<NotificationBell notifications={notifications} />
```

**판단 기준:**

| 기준             | 응집도 우선               | 명시성 우선                 |
| ---------------- | ------------------------- | --------------------------- |
| 재사용성         | 컴포넌트만 가져다 쓰면 됨 | 매번 상태 + props 연결 필요 |
| 변경 영향        | 해당 컴포넌트만 수정      | 페이지 + 모든 사용처 수정   |
| 데이터 흐름 파악 | 컴포넌트 내부로 이동 필요 | 페이지에서 바로 확인        |
| 테스트           | 데이터 계층(네트워크, QueryClient)을 흉내 내야 함 | props만 넣으면 되어 단위 테스트가 쉬움 |
| 요청 waterfall   | 컴포넌트가 중첩되면 생기기 쉬움 | 상위에서 한 번에 가져와 피하기 쉬움 |

**🔍 검색:**

- 추상화된 역할이 이름으로 명확한지
- 컴포넌트 내부에서 뭘 하는지 모르는 것 자체가 아닌, 이름의 명확성이 중요
- 일관된 패턴 사용 여부

---

### 2. 부수효과 위치 판단

**부수효과**: 주 동작 외에 발생하는 추가 동작 (저장, 알림, 로깅 등)

**내부에서 관리해도 되는 조건** (3가지 모두 충족 시):

1. 부수효과가 **항상 발생**해야 함
2. 부수효과가 **주 동작과 논리적으로 하나**임
3. 호출하는 쪽에서 **제어할 필요 없음**

```tsx
// 내부 관리 OK: 로그인 시 마지막 접속 시간 저장
const handleLogin = (credentials) => {
  authenticate(credentials);
  updateLastLoginTime(); // 항상 발생, 로그인의 일부
};
```

**분리해야 하는 조건** (하나라도 해당 시):

- 부수효과가 **선택적**임
- 호출처마다 **정책이 다를 수 있음**
- 테스트에서 **제외/대체 필요**

```tsx
// 분리 필요: 알림이 선택적일 때
const handleSubmit = (data) => saveData(data);

// 호출처에서 결정
onClick={() => {
  handleSubmit(data);
  if (userPreference.emailNotification) sendEmail();
}}
```

**판단 예시:**

| 상황      | 부수효과              | 판단    | 이유                      |
| --------- | --------------------- | ------- | ------------------------- |
| 로그인    | 마지막 접속 시간 저장 | 내부 OK | 항상 발생, 로그인의 일부  |
| 폼 제출   | 성공 토스트 표시      | 내부 OK | 항상 발생, UX의 일부      |
| 주문 완료 | 이메일 발송           | 분리    | 사용자 설정에 따라 다름   |
| 버튼 클릭 | 페이지 이동           | 분리    | 이동 경로가 상황마다 다름 |

위 표의 "내부 OK"는 그 화면의 이벤트 핸들러 안일 때다. 여러 곳에서 쓰는 함수나 훅(예: mutation 훅) 안이라면 호출처마다 원하는 게 다를 수 있으므로, 토스트·페이지 이동 같은 부수효과는 호출하는 쪽에 둔다.

**🔍 검색:**

- 함수 내부에 숨겨진 사이드이펙트 (logging, analytics)
- 선택적이어야 할 부수효과가 강제로 포함
- 호출처마다 다른 동작이 필요한데 하드코딩

---

### 3. 데이터 Fetching 패턴

**형제 컴포넌트가 각자 데이터를 가져오면 병렬로 실행된다:**

```tsx
// Good: 병렬 실행
function Dashboard() {
  return (
    <>
      <UserStats /> {/* 내부에서 fetchUserStats() */}
      <RecentOrders /> {/* 내부에서 fetchOrders() */}
      <Notifications /> {/* 내부에서 fetchNotifications() */}
    </>
  );
}
```

**페이지에서 모든 fetch를 관리하면 waterfall 위험:**

```tsx
// Bad: 순차 실행 위험
function Dashboard() {
  const stats = await fetchUserStats();
  const orders = await fetchOrders(); // stats 끝나야 시작
  const notifications = await fetchNotifications(); // orders 끝나야 시작
  // ...
}
```

**컴포넌트가 중첩되면 waterfall이 생긴다:**

```tsx
// Bad: 자식은 부모 데이터가 온 뒤에야 렌더되므로 댓글 요청이 늦게 시작된다
function Article({ id }) {
  const { data: article } = useSuspenseQuery(articleQuery(id));
  return (
    <>
      <ArticleBody article={article} />
      <Comments id={id} /> {/* 여기서 또 useSuspenseQuery */}
    </>
  );
}

// Good: 함께 필요한 쿼리를 위로 끌어올려 병렬로 가져온다
function Article({ id }) {
  const [{ data: article }, { data: comments }] = useSuspenseQueries({
    queries: [articleQuery(id), commentsQuery(id)],
  });
  return (
    <>
      <ArticleBody article={article} />
      <Comments comments={comments} />
    </>
  );
}
```

- 한 컴포넌트 안에서 `useSuspenseQuery`를 여러 번 쓰면 하나씩 차례로 기다린다 → `useSuspenseQueries`로 묶는다.
- 자식이 꼭 직접 가져와야 하면, 부모에서 같은 쿼리를 미리 가져온다(prefetch).
- 출처: [TanStack Query — Request Waterfalls](https://tanstack.com/query/latest/docs/framework/react/guides/request-waterfalls)

**Suspense로 즉시 렌더링 영역과 로딩 영역 분리:**

```tsx
<header>
  <Logo />           {/* 즉시 렌더링 */}
  <Navigation />     {/* 즉시 렌더링 */}
</header>
<Suspense fallback={<TableSkeleton />}>
  <DataTable />      {/* 데이터 로딩 */}
</Suspense>
```

**AsyncBoundary: Suspense + ErrorBoundary 조합:**

```tsx
// Bad: Suspense만 쓰면 에러 발생 시 캐치 불가
<Suspense fallback={<Skeleton />}>
  <DataComponent />  {/* 에러 발생 시 전체 페이지로 전파 */}
</Suspense>

// Good: AsyncBoundary로 로딩 + 에러 모두 처리
<AsyncBoundary
  pendingFallback={<Skeleton />}
  rejectedFallback={<ErrorWithRetry />}
>
  <DataComponent />
</AsyncBoundary>
```

**AsyncBoundary의 이점:**

- 로딩 중에는 스켈레톤 UI -> 레이아웃 시프트 방지
- API 에러 시 재시도 버튼이 있는 fallback 표시
- 에러가 해당 컴포넌트에서 격리됨 -> 나머지 UI는 정상 동작

**🔍 검색:**

- 순차 await로 인한 waterfall 패턴
- 부모 데이터가 온 뒤 렌더되는 자식의 추가 fetch (중첩 waterfall)
- 한 컴포넌트 안의 여러 `useSuspenseQuery`
- Suspense 없는 데이터 fetching 컴포넌트
- Suspense만 사용하고 ErrorBoundary 누락
- useSuspenseQuery 사용 시 AsyncBoundary 적용 여부

---

### 4. 네이밍 원칙

**핵심**: 모든 이름은 내부 코드를 보지 않고도 역할과 동작을 유추할 수 있어야 한다.

#### 4.1 컴포넌트 네이밍

```tsx
// Bad: 내부를 봐야 알 수 있음
<Card />           // 무슨 카드?
<List />           // 무슨 리스트?
<Modal />          // 무슨 용도?

// Good: 이름만으로 역할 파악
<ProductCard />    // 상품 정보를 카드로 표시
<OrderHistoryList /> // 주문 내역 목록
<ConfirmDeleteModal /> // 삭제 확인 모달
```

#### 4.2 함수 네이밍

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

```tsx
// Bad: 동작이 모호함
function process(data) { ... }
function doSomething() { ... }
function handleData() { ... }

// Good: 동작이 명확함
function validateAndSubmitForm(formData) { ... }
function formatPriceWithCurrency(price, currency) { ... }
function parseSearchParamsToFilters(searchParams) { ... }
```

#### 4.3 훅 네이밍

| 패턴                           | 예시                  | 반환값 유추         |
| ------------------------------ | --------------------- | ------------------- |
| `use` + 명사                   | `useUser()`           | 사용자 데이터       |
| `use` + 명사 + 동작            | `useCartItems()`      | 장바구니 아이템들   |
| `use` + 대상 + `List`          | `useProductList()`    | 상품 목록           |
| `use` + 상태명 + `State`       | `useSortState()`      | 정렬 상태 + setter  |
| `use` + param명 + `QueryParam` | `usePageQueryParam()` | URL의 page 파라미터 |

훅 이름에는 데이터를 **어떻게** 가져오는지(`fetch`, `get`)를 넣지 않고 **무엇**을 주는지만 쓴다. HTTP로 가져오든 캐시나 로컬 스토리지에서 가져오든 쓰는 쪽은 바뀌지 않아야 한다. API를 직접 호출하는 함수는 `fetchUserProfile()`처럼 `fetch`를 쓰고, 그 결과를 컴포넌트에 주는 훅은 `useUserProfile()`처럼 목적으로 짓는다.

```tsx
// Bad: 반환값을 유추하기 어려움
const data = useData(); // 무슨 데이터?
const result = useQuery(); // 무슨 쿼리?
const state = useAppState(); // 앱의 어떤 상태?

// Good: 반환값이 명확함
const user = useCurrentUser(); // 현재 로그인한 사용자
const [sort, setSort] = useSortState(); // 정렬 상태
const { products, isLoading } = useProductList(); // 상품 목록
```

#### 4.4 상수 네이밍

```tsx
// Bad: 의미 불명확
const MAX = 10;
const TIMEOUT = 3000;
const URL = '/api/users';

// Good: 용도가 명확
const MAX_RETRY_COUNT = 10;
const API_TIMEOUT_MS = 3000;
const USER_API_ENDPOINT = '/api/users';
```

#### 4.5 불리언 네이밍

```tsx
// Bad: 불리언인지 불명확
const loading = true;
const error = false;
const visible = true;

// Good: 불리언임이 명확
const isLoading = true;
const hasError = false;
const isVisible = true;
const canSubmit = true;
const shouldRefetch = false;
```

**🔍 검색:**

1. 이름만 보고 3초 안에 역할을 알 수 있는가?
2. 같은 역할에 같은 패턴을 사용하는가?
3. `data`, `info`, 대상이 없는 `handle`(`handleData`) 같은 모호한 이름이 아닌가?
4. 실제 동작과 이름이 일치하는가?

---

### 5. 메모이제이션 적용 기준

**원칙: "측정 후 필요할 때만"**

React.memo, useMemo, useCallback은 공짜가 아니다. 잘못 사용하면 오버헤드만 추가된다.

React Compiler를 쓰는 프로젝트라면 컴파일러가 값과 함수를 자동으로 메모이제이션하므로 `memo`·`useMemo`·`useCallback`을 손으로 붙일 일이 거의 없다. 아래 기준은 컴파일러를 쓰지 않을 때 적용한다. ([React Compiler](https://react.dev/learn/react-compiler))

#### memo가 의미 없는 경우

```tsx
// memo 의미없음: props가 매번 바뀜
const Button = memo(({ isActive, onClick }) => { ... });

// 사용처에서
<Button
  isActive={selectedId === item.id}  // 상태가 바뀔 때마다 새 값
  onClick={() => handleSelect(item.id)}  // 매 렌더링마다 새 함수 생성
/>
```

#### memo가 효과적인 경우

```tsx
// memo 효과적: 리스트 아이템
const ListItem = memo(({ item }) => {
  return <div>{item.name}</div>;
});

// 사용처에서
{
  items.map((item) => <ListItem key={item.id} item={item} />);
}
```

#### memo가 무의미해지는 패턴

```tsx
// Bad: 인라인 객체/함수를 props로 전달
<MemoizedComponent
  style={{ color: 'red' }} // 매번 새 객체
  onClick={() => doSomething()} // 매번 새 함수
  config={{ enabled: true }} // 매번 새 객체
/>;

// Good: 안정적인 참조로 전달
const style = useMemo(() => ({ color: 'red' }), []);
const handleClick = useCallback(() => doSomething(), []);

<MemoizedComponent
  style={style}
  onClick={handleClick}
  config={CONFIG} // 모듈 스코프 상수
/>;
```

#### 적용 판단 기준

| 상황                               | memo 필요? | 이유                             |
| ---------------------------------- | ---------- | -------------------------------- |
| 리스트에서 반복 렌더링되는 아이템  | 고려       | 일부만 변경 시 효과적            |
| props가 primitive 값으로 안정적    | 고려       | 비교 비용 낮고 효과 있음         |
| props가 매번 새로운 객체/함수      | 불필요     | 비교만 하고 항상 리렌더링        |
| 렌더링 비용이 낮은 간단한 컴포넌트 | 불필요     | 최적화 이득이 거의 없음          |
| 부모가 자주 리렌더링되지 않음      | 불필요     | 문제가 없는데 최적화할 필요 없음 |

#### useMemo / useCallback 기준

```tsx
// 불필요: 계산 비용이 낮음
const fullName = useMemo(
  () => `${firstName} ${lastName}`,
  [firstName, lastName],
);

// 필요: 비용이 높은 계산
const sortedItems = useMemo(
  () => [...items].sort((a, b) => complexSortLogic(a, b)),
  [items],
);

// 필요: 대량 데이터 필터링/변환
const filteredData = useMemo(
  () => largeDataset.filter((item) => item.category === category),
  [largeDataset, category],
);

// 필요: memo된 자식에게 전달하는 콜백
const handleItemClick = useCallback((id) => onSelect(id), [onSelect]);
```

**🔍 검색:**

- 불필요한 memo, useMemo, useCallback 사용
- memo된 컴포넌트에 인라인 객체/함수 전달
- 계산 비용이 낮은데 useMemo 적용
- memo 없이 리스트 아이템 렌더링

---

### 6. 안티패턴 탐지

| 안티패턴                | 설명                                     | 해결책                       |
| ----------------------- | ---------------------------------------- | ---------------------------- |
| **God Hook**            | 모든 상태를 관리하는 단일 훅             | 책임별로 훅 분리             |
| **Prop Drilling**       | 중간 컴포넌트가 사용하지 않는 props 전달 | 컴포넌트 합성 먼저, Context는 최후 수단 |
| **Props -> State 복사** | props를 받아서 내부 useState에 복사      | props 직접 사용 (Controlled), 초기값 전용이면 `initialX` 이름 |
| **Waterfall Fetch**     | 순차 await, 또는 중첩 컴포넌트가 차례로 fetch | 형제는 각자 fetch, 중첩은 쿼리 끌어올리기·prefetch·`useSuspenseQueries` |
| **과도한 명시성**       | 재사용마다 훅 + props 연결 반복          | 응집도 우선 패턴 검토        |
| **패턴 불일치**         | 같은 역할인데 다른 패턴 사용             | 컨벤션 통일                  |

**God Hook 예시:**

```tsx
// Bad
function usePageState() {
  const [user, setUser] = useState();
  const [cart, setCart] = useState();
  const [notifications, setNotifications] = useState();
  const [theme, setTheme] = useState();
  // 모든 것을 하나에서 관리
}

// Good: 책임별 분리
function useUser() {
  /* 사용자만 */
}
function useCart() {
  /* 장바구니만 */
}
function useNotifications() {
  /* 알림만 */
}
```

**Props -> State 복사:**

```tsx
// Bad: 동기화 문제 발생
function Modal({ isOpen }) {
  const [open, setOpen] = useState(isOpen); // props 복사
}

// Good: Controlled Component
function Modal({ isOpen, onClose }) {
  // props 직접 사용
  if (!isOpen) return null;
}
```

**예외:** 초기값만 쓰고 이후 props 변경을 일부러 무시하는 경우에는 `initialOpen`·`defaultOpen`처럼 `initial`·`default`로 시작하는 이름으로 드러내면 괜찮다. ([React — Don't mirror props in state](https://react.dev/learn/choosing-the-state-structure#don-t-mirror-props-in-state))

**🔍 검색:**

- useState로 props 복사하는 패턴 (`initial`·`default` 이름이 아닌 경우)
- 5개 이상 상태를 관리하는 단일 Hook
- 3단계 이상 Props Drilling
- 같은 역할의 다른 패턴 사용

---

### 7. 리뷰 체크리스트 기반 검토

최종 검토 체크리스트:

1. **네이밍**: 이름만 보고 역할과 동작을 즉시 이해할 수 있는가?
2. **응집도**: 이 기능을 수정할 때 몇 개 파일을 건드려야 하는가?
3. **상태 위치**: 이 상태를 상위에서 알아야 하는 이유가 있는가?
4. **부수효과**: 이 부수효과는 항상 발생해야 하는가, 선택적인가?
5. **패턴 일관성**: 같은 역할의 다른 컴포넌트와 패턴이 일치하는가?
6. **데이터 흐름**: 불필요한 props 전달이나 waterfall이 있는가?
7. **에러 처리**: Suspense와 ErrorBoundary가 함께 사용되었는가?
8. **메모이제이션**: 실제 성능 문제 없이 과도하게 최적화하고 있지 않은가?
