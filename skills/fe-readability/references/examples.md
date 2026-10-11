# 가독성 (Readability) 예시

`fe-readability` 스킬의 항목별 상세 설명, Bad/Good 코드, 확인 질문(🔍)입니다.

### 1. 같이 실행되지 않는 코드 분리하기

동시에 실행되지 않는 코드가 하나의 함수 또는 컴포넌트에 있으면, 동작을 한눈에 파악하기 어렵고 구현 부분에 많은 분기가 들어가서 역할 이해가 어렵습니다.

**Bad:**

```tsx
function SubmitButton() {
  const isViewer = useRole() === 'viewer';

  useEffect(() => {
    if (isViewer) {
      return;
    }
    showButtonAnimation();
  }, [isViewer]);

  return isViewer ? (
    <TextButton disabled>Submit</TextButton>
  ) : (
    <Button type="submit">Submit</Button>
  );
}
```

**Good:**

```tsx
function SubmitButton() {
  const isViewer = useRole() === 'viewer';
  return isViewer ? <ViewerSubmitButton /> : <AdminSubmitButton />;
}

function ViewerSubmitButton() {
  return <TextButton disabled>Submit</TextButton>;
}

function AdminSubmitButton() {
  useEffect(() => {
    showButtonAnimation();
  }, []);
  return <Button type="submit">Submit</Button>;
}
```

**🔍 검색:**

- 조건분기가 여러 곳에 산재되어 한 컴포넌트에서 고려해야 할 맥락이 많은가?
- 상호 배타적인 상태를 동일 컴포넌트에서 관리하고 있는가?
- useEffect 내부에 early return 패턴이 있는가?
- 역할이 완전히 다른 UI가 삼항 연산자로 분기되는가?

### 2. 구현 상세 추상화하기

한 사람이 코드를 읽을 때 동시에 고려할 수 있는 총 맥락의 숫자는 제한되어 있습니다 (약 6-7개). 불필요한 구현 세부사항을 숨겨 한 번에 인지해야 할 맥락을 줄입니다.

**Bad (로그인 확인과 리다이렉트 로직 노출):**

```tsx
function LoginStartPage() {
  useCheckLogin({
    onChecked: (status) => {
      if (status === 'LOGGED_IN') {
        location.href = '/home';
      }
    },
  });
  // ... 로그인 관련 로직이 노출됨
}
```

**Good (Wrapper 컴포넌트로 추상화):**

```tsx
function AuthGuard({ children }) {
  const status = useCheckLoginStatus();
  useEffect(() => {
    if (status === 'LOGGED_IN') {
      location.href = '/home';
    }
  }, [status]);
  return status !== 'LOGGED_IN' ? children : null;
}

function LoginStartPage() {
  return (
    <AuthGuard>
      <LoginForm />
    </AuthGuard>
  );
}
```

**Bad (버튼과 클릭 로직이 멀리 떨어짐):**

```tsx
function FriendInvitation() {
  const handleClick = async () => {
    const canInvite = await overlay.openAsync(/* 복잡한 다이얼로그 구현 */);
    if (canInvite) {
      await sendPush();
    }
  };
  // ... 중간에 다른 코드가 많음 ...
  return <Button onClick={handleClick}>초대하기</Button>;
}
```

**Good (로직을 컴포넌트에 근접하게):**

```tsx
function InviteButton({ name }) {
  return (
    <Button
      onClick={async () => {
        const canInvite = await overlay.openAsync(/* ... */);
        if (canInvite) await sendPush();
      }}
    >
      초대하기
    </Button>
  );
}
```

**🔍 검색:**

- 한 컴포넌트가 한 번에 인지해야 할 맥락이 6-7개를 초과하는가?
- 구현 상세(복잡한 로직)가 불필요하게 노출되어 있는가?
- 버튼과 클릭 핸들러 같이 함께 수정되는 코드가 멀리 떨어져 있는가?
- HOC나 Wrapper 컴포넌트로 분리할 수 있는 반복 패턴이 있는가?
- 인증/권한 로직이 여러 페이지에 중복되어 있는가?

### 3. 로직 종류에 따라 합쳐진 함수 쪼개기

쿼리 파라미터, 상태, API 호출과 같은 로직의 종류에 따라서 함수나 컴포넌트, Hook을 만들지 마세요. 페이지가 다루는 맥락이 다양해질수록 코드의 이해와 수정이 어려워집니다.

**Bad:**

```tsx
function usePageState() {
  const [cardId, setCardId] = useQueryParam('cardId');
  const [dateFrom, setDateFrom] = useQueryParam('dateFrom');
  const [dateTo, setDateTo] = useQueryParam('dateTo');
  const [statusList, setStatusList] = useQueryParam('statusList');

  return { cardId, dateFrom, dateTo, statusList };
}
```

**문제점:**

- Hook이 담당할 책임이 무제한적으로 늘어남 (새 쿼리 파라미터가 계속 추가)
- Hook을 사용하는 컴포넌트는 모든 쿼리 파라미터 변경 시 리렌더링됨 (예: `cardId`만 필요해도 `dateFrom` 변경 시 불필요한 리렌더링)

**Good:**

```tsx
function useCardIdQueryParam() {
  const [cardId, _setCardId] = useQueryParam('cardId', NumberParam);
  const setCardId = useCallback((id: number) => {
    _setCardId({ cardId: id }, 'replaceIn');
  }, []);
  return [cardId ?? undefined, setCardId] as const;
}
```

**개선 효과:**

- 명확한 Hook 이름으로 책임 범위 명시
- 필요한 상태만 사용하여 불필요한 리렌더링 방지
- 수정 영향 범위 축소

**🔍 검색:**

- 하나의 함수/Hook이 여러 로직 종류를 동시에 관리하는가?
- 새 기능 추가 시 기존 로직 집합체가 계속 확장되는가?
- 일부 상태만 필요한데 전체 Hook을 import하는가?
- Hook 사용 시 불필요한 값까지 구조분해하고 있는가?

### 4. 복잡한 조건에 이름 붙이기

복잡한 조건식에 명시적인 이름을 붙여 코드의 의도를 명확히 드러내고, 한 번에 고려해야 할 맥락을 줄입니다.

**Bad:**

```tsx
const result = products.filter((product) =>
  product.categories.some(
    (category) =>
      category.id === targetCategory.id &&
      product.prices.some((price) => price >= minPrice && price <= maxPrice),
  ),
);
```

**Good:**

```tsx
const matchedProducts = products.filter((product) => {
  return product.categories.some((category) => {
    const isSameCategory = category.id === targetCategory.id;
    const isPriceInRange = product.prices.some(
      (price) => price >= minPrice && price <= maxPrice,
    );
    return isSameCategory && isPriceInRange;
  });
});
```

**When to name:**

- 복잡한 로직이 여러 줄에 걸쳐 처리될 때
- 동일 로직을 여러 곳에서 반복 사용할 때
- 단위 테스트가 필요할 때

**When NOT to name:**

- 로직이 매우 간단할 때 (예: `arr.map(x => x * 2)`)
- 특정 로직이 코드 내에서 한 번만 사용될 때

### 5. 매직 넘버에 이름 붙이기

매직 넘버란 정확한 뜻을 밝히지 않고 소스 코드 안에 직접 숫자 값을 넣는 것입니다. 숫자의 의도가 불분명하면 코드를 읽는 사람이 그 값이 애니메이션 완료 대기인지, 서버 반영 대기인지, 테스트 코드 잔여물인지 알 수 없습니다.

**Bad:**

```tsx
async function onLikeClick() {
  await postLike(url);
  await delay(300); // 애니메이션? 서버 반영 시간? 테스트 잔여물?
  await refetchPostLike();
}
```

**Good:**

```tsx
const ANIMATION_DELAY_MS = 300;

async function onLikeClick() {
  await postLike(url);
  await delay(ANIMATION_DELAY_MS);
  await refetchPostLike();
}
```

**🔍 검색:**

- 숫자 값의 의도가 명확한가?
- 타이밍 관련 숫자 (300, 1000, 5000 등)
- 크기/제한 관련 숫자 (10, 100, 1024 등)
- HTTP 상태 코드가 하드코딩된 경우
- 재사용되는 숫자가 상수로 선언되었는가?
- 상수명이 숫자의 목적을 설명하는가?

### 6. 시점 이동 줄이기

코드를 읽을 때 위아래를 왕복하거나 여러 파일/함수/변수를 넘나들지 않도록 작성해야 합니다. 코드를 위에서 아래로, 하나의 함수나 파일 내에서 읽을 수 있도록 구성하면 동작을 빠르게 파악할 수 있습니다.

**Bad:**

```tsx
function Page() {
  const user = useUser();
  const policy = getPolicyByRole(user.role);

  return (
    <div>
      <Button disabled={!policy.canInvite}>Invite</Button>
      <Button disabled={!policy.canView}>View</Button>
    </div>
  );
}

function getPolicyByRole(role) {
  const policy = POLICY_SET[role];
  return {
    canInvite: policy.includes('invite'),
    canView: policy.includes('view'),
  };
}

const POLICY_SET = {
  admin: ['invite', 'view'],
  viewer: ['view'],
};
```

**문제점:** "Invite 버튼이 비활성화된 이유"를 파악하려면 3번의 시점 이동 필요 (`policy.canInvite` -> `getPolicyByRole()` -> `POLICY_SET`)

**Good (Option A - 조건을 펼쳐서 그대로 드러내기):**

```tsx
function Page() {
  const user = useUser();

  switch (user.role) {
    case 'admin':
      return (
        <div>
          <Button disabled={false}>Invite</Button>
          <Button disabled={false}>View</Button>
        </div>
      );
    case 'viewer':
      return (
        <div>
          <Button disabled={true}>Invite</Button>
          <Button disabled={false}>View</Button>
        </div>
      );
    default:
      return null;
  }
}
```

**Good (Option B - 한눈에 보이는 객체):**

```tsx
function Page() {
  const user = useUser();
  const policy = {
    admin: { canInvite: true, canView: true },
    viewer: { canInvite: false, canView: true },
  }[user.role];

  return (
    <div>
      <Button disabled={!policy.canInvite}>Invite</Button>
      <Button disabled={!policy.canView}>View</Button>
    </div>
  );
}
```

**🔍 검색:**

- 코드 이해를 위해 여러 함수/파일을 오가야 하는가?
- 조건 파악을 위해 3단계 이상 점프가 필요한 코드가 있는가?
- 권한/정책 로직을 컴포넌트 내에서 한눈에 파악할 수 있는가?
- 위에서 아래로 읽을 수 없는 구조인가?

### 7. 삼항 연산자 단순하게 하기

여러 삼항 연산자가 중첩되면 조건의 구조가 명확하게 보이지 않아서 코드를 읽기 어려워집니다.

**Bad:**

```tsx
const status =
  A조건 && B조건 ? 'BOTH' : A조건 || B조건 ? (A조건 ? 'A' : 'B') : 'NONE';
```

**Good:**

```tsx
const status = (() => {
  if (A조건 && B조건) return 'BOTH';
  if (A조건) return 'A';
  if (B조건) return 'B';
  return 'NONE';
})();
```

**🔍 검색:**

- 2단계 이상 중첩된 삼항 연산자가 있는가?
- 삼항 연산자 내부에 && 또는 || 가 사용되는가?
- 한 줄이 80자를 넘는 삼항 연산자가 있는가?
- if 문으로 풀어낼 수 있는 복잡한 조건식이 있는가?

### 8. 비교 순서 자연스럽게 하기

범위를 확인하는 조건문에서 부등호의 순서가 자연스럽지 않으면, 코드를 읽는 사람이 조건의 의도를 파악하는 데 시간이 더 걸립니다. 수학의 부등식처럼 시작점에서 끝점으로 자연스럽게 흐르도록 작성합니다.

**Bad:**

```tsx
if (a >= b && a <= c) {
  ...
}

if (score >= 80 && score <= 100) {
  console.log("우수");
}

if (price >= minPrice && price <= maxPrice) {
  console.log("적정 가격");
}
```

**Good:**

```tsx
if (b <= a && a <= c) {
  ...
}

if (80 <= score && score <= 100) {
  console.log("우수");
}

if (minPrice <= price && price <= maxPrice) {
  console.log("적정 가격");
}
```

**🔍 검색:**

- 범위 조건이 수학의 부등식 형태(`최솟값 <= 값 && 값 <= 최댓값`)로 읽히는가?
- 변수가 두 번 반복되는 불필요한 인지 부담이 있는가?
- 코드를 읽는 사람이 범위를 직관적으로 파악할 수 있는가?
