# React 상태 배치 예시

`fe-state` 스킬의 원칙별 상세 설명, 찾아야 할 것과 안티패턴, Bad/Good 코드, 확인할 Grep 패턴(🔍)입니다.

### 1. 상태 성질 기반 분류

상태를 3가지 성질로 분류하면 올바른 도구가 자연스럽게 결정된다.

| 성질 | 질문 | 예시 |
| --- | --- | --- |
| **수명(lifecycle)** | 페이지 이동해도 살아있어야 하나? | 장바구니 Yes, 모달 No |
| **공유 범위(scope)** | 관련 없는 컴포넌트끼리도 써야 하나? | 유저 정보 Yes, 폼 입력 No |
| **변경 빈도** | 초 단위로 바뀌나, 가끔 바뀌나? | 검색 입력 자주, 테마 가끔 |

**✅ 찾아야 할 것:**

- 상태 성질에 맞는 도구 사용:
  - 서버 데이터(길다/넓다/다양) → React Query / SWR
  - 인증/테마/언어(길다/넓다/거의 없음) → Context API
  - 장바구니(길다/넓다/자주) → Zustand / Redux
  - 라우팅/검색 필터(길다/넓다/다양) → URL 파라미터
  - 폼 입력(짧다/좁다/자주) → useState / React Hook Form
  - UI 토글(짧다/좁다/가끔) → useState

**❌ 안티패턴:**

- 서버 데이터를 useState + useEffect로 관리 (React Query/SWR 대신)
- 폼 입력값을 전역 스토어(Zustand/Redux)에 저장
- URL에 있어야 할 검색 필터를 useState로 관리 (공유/북마크 불가)
- 짧은 수명의 UI 상태를 전역에 저장

**🔍 검색:**

```typescript
// 서버 데이터를 useState로 관리하는 패턴
- Grep: "useState.*fetch|useEffect.*fetch|useEffect.*axios|useEffect.*api"
// 전역 스토어 사용
- Grep: "useStore|useSelector|useRecoilState|useAtom|create\\("
// React Query/SWR 사용
- Grep: "useQuery|useMutation|useSWR"
// URL 상태
- Grep: "useSearchParams|useRouter|useParams"
```

---

### 2. Context API 올바른 사용

Context는 **의존성 주입(DI) 도구**이지 상태관리 도구가 아니다. 값을 트리 아래로 전달하는 파이프일 뿐, 상태를 실제로 들고 있는 건 항상 useState나 useReducer다.

**상태관리 도구의 4가지 요건:**

| 요건 | Context API | Zustand/Redux |
| --- | --- | --- |
| 값을 저장한다 | ❌ useState가 저장 | ✅ store가 저장 |
| 값을 읽는다 | ✅ useContext | ✅ selector |
| 값을 업데이트한다 | ❌ 자체 방법 없음 | ✅ action/dispatch |
| 변경을 알린다 | △ 전부 리렌더 | ✅ 구독자만 리렌더 |

**✅ 찾아야 할 것:**

- Context를 DI 목적으로 사용 (테마, 인증, 설정 등 드물게 바뀌는 값)
- Context 분할: State / Dispatch / Config 별도 Context
- Provider 값 메모이제이션 (`useMemo`로 래핑)
- 진짜 상태관리 라이브러리가 Context를 DI로만 사용하는 패턴

**❌ 안티패턴:**

- 자주 바뀌는 상태를 Context에 넣기 (장바구니, 검색 입력 등)
- 여러 관심사를 하나의 Context에 묶기 (user + theme + cart)
- 메모이되지 않은 Provider 값: `value={{ user, theme, cart }}`
- 부분 구독이 필요한 상태를 Context로 관리

```jsx
// ❌ cart만 바뀌어도 theme만 읽는 컴포넌트까지 전부 리렌더
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [cart, setCart] = useState([]);
  return (
    <AppContext.Provider value={{ user, theme, cart }}>
      {children}
    </AppContext.Provider>
  );
}
```

**🔍 검색:**

```typescript
// Context 생성 및 Provider 패턴
- Grep: "createContext"
- Grep: "Provider value="
- Grep: "useContext"
// 메모이제이션 여부 확인
- Provider value에 useMemo 래핑 여부 확인
```

---

### 3. 5단계 에스컬레이터 준수

가장 단순한 것부터 시도하고, 진짜 아플 때만 올라가야 한다.

```
1단계: useState         — 이 컴포넌트에서만 쓴다
2단계: Prop Drilling    — 자식 1~2단계
3단계: 컴포넌트 합성    — 3단계+ 인데 중간이 안 쓴다
4단계: Context API      — 드물게 바뀌고 + 넓게 퍼진 값
5단계: 전역 상태관리    — 자주 바뀌고 + 넓게 퍼진 값
```

**✅ 찾아야 할 것:**

- useState로 충분한 로컬 상태가 적절히 사용됨
- 1~2단계 prop 전달은 명시적 의존성으로 허용
- children / render props를 활용한 컴포넌트 합성
- Context는 드물게 바뀌는 넓은 범위 값에만 사용
- 전역 스토어는 자주 바뀌고 넓게 퍼진 값에만 사용

**❌ 안티패턴:**

- prop drilling 회피 목적만으로 전역 상태 사용 (jungpaeng: "props drilling을 피하려고 전역 상태를 쓰지 마라")
- 컴포넌트 합성으로 해결 가능한데 Context/전역 상태로 점프
- 중간 컴포넌트가 쓰지도 않는 props를 전달만 하는 구조 (합성 기회)

```jsx
// ❌ 중간이 전달만 함 — 합성으로 해결 가능
function App() {
  const [user, setUser] = useState(null);
  return <Layout user={user} />;
}
function Layout({ user }) {
  return <Sidebar user={user} />;
}
function Sidebar({ user }) {
  return <UserMenu user={user} />;
}

// ✅ 컴포넌트 합성 — 구조를 바꿔서 해결
function App() {
  const [user, setUser] = useState(null);
  return (
    <Layout
      sidebar={
        <Sidebar userMenu={<UserMenu user={user} />} />
      }
    />
  );
  // App -> UserMenu 직통! Layout과 Sidebar는 user를 몰라도 됨
}
```

**🔍 검색:**

```typescript
// Props drilling 깊이 추적
- 같은 prop 이름이 여러 컴포넌트를 거쳐 전달되는지 확인
- Grep: "children|render=|\\bslot" (합성 패턴)
// 전역 스토어에서 단순 값만 읽는 경우
- Grep: "useStore|useSelector" → 해당 값이 로컬로 충분한지 평가
```

---

### 4. 서버 상태 vs 클라이언트 상태 분리

서버에서 온 데이터와 클라이언트에서 생성한 데이터는 근본적으로 다르다. 서버 상태는 캐싱, 무효화, 재요청, 동기화가 필요하며, 이를 useState + useEffect로 직접 관리하면 복잡성이 폭발한다.

**✅ 찾아야 할 것:**

- 서버 데이터: React Query / SWR / RTK Query 사용
- 캐싱/무효화 전략 존재
- 로딩/에러 상태의 선언적 처리
- Optimistic update 패턴

**❌ 안티패턴:**

- API 호출을 useState + useEffect로 직접 관리
- 서버 데이터를 전역 스토어(Redux/Zustand)에 캐싱
- 로딩/에러 상태를 수동으로 관리 (`isLoading`, `error` useState)
- 같은 API를 여러 컴포넌트에서 중복 호출 (캐시 없이)

```jsx
// ❌ 서버 데이터를 직접 관리
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);
}

// ✅ React Query로 서버 상태 관리
function UserProfile({ userId }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
}
```

**🔍 검색:**

```typescript
// useState + useEffect로 서버 데이터 관리
- Grep: "useEffect.*fetch|useEffect.*get.*api|useEffect.*axios"
- Grep: "setLoading|isLoading.*useState|loading.*useState"
// React Query / SWR 사용
- Grep: "useQuery|useMutation|useSWR|useInfiniteQuery"
```

---

### 5. 불필요한 전역 상태

전역 상태 라이브러리는 "저장소"가 아니라 **아키텍처 패턴**을 제공할 때 의미가 있다. 핵심 차별점은 **부분 구독(selector)**이다.

**✅ 찾아야 할 것:**

- 전역 스토어에 적합한 상태만 저장 (자주 바뀌고 + 넓게 퍼진 값)
- Selector를 사용한 부분 구독으로 리렌더 최소화
- 스토어의 명확한 관심사 분리

**❌ 안티패턴:**

- 전역 스토어를 "모든 상태의 창고"로 사용
- 모달 open/close 같은 UI 상태를 전역에 저장
- 특정 페이지에서만 쓰는 상태를 전역에 저장
- Selector 없이 전체 store 구독: `const state = useStore()`

```jsx
// ❌ 전체 store 구독 — 아무 값이나 바뀌면 리렌더
const { items, total, discount } = useCartStore();

// ✅ Selector로 필요한 값만 구독
const count = useCartStore((s) => s.items.length);
const total = useCartStore((s) => s.total);
// → 각각 자기 값이 바뀔 때만 리렌더
```

**🔍 검색:**

```typescript
// 전역 스토어 사용 패턴
- Grep: "create\\(|defineStore|createSlice|atom\\("
// Selector 사용 여부
- Grep: "useStore\\(\\)|useSelector\\(\\s*\\)" (selector 없이 전체 구독)
// 스토어에 저장된 상태 확인 → 로컬로 충분한지 평가
```

---

### 6. Props 전달 vs 내부 관리 판단

**핵심 질문: "상위에서 그 값을 알아야 하는 이유가 있는가?"**

| 상황                          | 결론              | 예시                                      |
| ----------------------------- | ----------------- | ----------------------------------------- |
| 상위에서 조건부 렌더링에 사용 | props로 전달      | `isLoggedIn`일 때만 Dashboard 표시        |
| 상위에서 직접 사용하지 않음   | 내부에서 관리     | 드롭다운 열림 상태는 해당 컴포넌트만 사용 |
| 여러 컴포넌트가 공유 필요     | 상위로 끌어올리기 | 선택된 탭을 Header와 Content가 공유       |

**상태 저장소에 따른 공유 방식:**

| 상태 저장소     | 여러 컴포넌트에서 호출 시        | 응집도 우선 가능? |
| --------------- | -------------------------------- | ----------------- |
| URL query param | 같은 URL 읽음 -> 자동 공유       | 가능              |
| Context         | 같은 Context 읽음 -> 자동 공유   | 가능              |
| localStorage    | 같은 키 읽음 -> 자동 공유        | 가능              |
| 내부 useState   | 각자 별도 인스턴스 -> 공유 안 됨 | 공유 필요 시 불가 |

**Good Example:**

```tsx
// URL로 관리되는 경우 -> 각자 읽어도 OK
function Pagination() {
  const [page] = useQueryParam('page'); // URL에서 읽음
}

function ProductList() {
  const [page] = useQueryParam('page'); // 같은 URL에서 읽음 -> 동기화됨
}
```

**🔍 검색:**

- 불필요하게 props로 전달하는 상태
- 내부 useState를 공유가 필요한 상황에 사용
- 외부 상태(URL, Context)를 활용하지 않고 props drilling
