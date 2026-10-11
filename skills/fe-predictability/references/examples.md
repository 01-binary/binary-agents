# 예측 가능성 (Predictability) 예시

`fe-predictability` 스킬의 항목별 상세 설명, Bad/Good 코드, 확인 질문(🔍)입니다.

### 1. 이름 겹치지 않게 관리하기

같은 이름을 가지는 함수나 변수는 동일한 동작을 해야 합니다. 작은 동작 차이가 코드의 예측 가능성을 낮추고, 코드를 읽는 사람에게 혼란을 줄 수 있습니다.

**Bad:**

```tsx
import { http as httpLibrary } from '@some-library/http';

export const http = {
  async get(url: string) {
    const token = await fetchToken();
    return httpLibrary.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
```

**문제점:** 원본 라이브러리 `http`와 서비스의 `http`가 동일한 이름이지만 서로 다른 동작을 수행합니다. 개발자가 단순 GET 요청만 있다고 예상하지만, 실제로는 토큰 조회라는 추가 로직이 포함되어 있습니다.

**Good:**

```tsx
import { http as httpLibrary } from '@some-library/http';

export const httpService = {
  async getWithAuth(url: string) {
    const token = await fetchToken();
    return httpLibrary.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
```

**개선점:** 라이브러리와 구분되는 명확한 이름(`httpService`) + 동작을 명시한 함수명(`getWithAuth`)으로 함수명만으로 "인증된 요청"임을 파악 가능합니다.

**🔍 검색:**

- 같은 이름의 함수/변수가 서로 다른 동작을 하는가?
- 라이브러리 이름과 서비스 이름이 중복되는가?
- 함수명이 실제 동작(특히 추가 로직)을 반영하는가?
- 암묵적 동작이 추가된 유틸리티 함수가 있는가?

### 2. 같은 종류의 함수는 반환 타입 통일하기

같은 종류의 함수나 Hook이 서로 다른 반환 타입을 가지면 코드의 일관성이 떨어져서, 같이 일하는 동료들이 코드를 읽는 데에 헷갈릴 수 있습니다.

**Bad (API Hook 반환 불일치):**

```tsx
// useUser는 Query 객체 반환
const { data, isLoading } = useUser();

// useServerTime은 데이터만 반환 (query.data)
const serverTime = useServerTime();
```

**문제점:** 같은 API 호출 Hook인데 하나는 Query 객체, 하나는 데이터만 반환합니다. 사용하는 사람이 매번 내부 구현을 확인해야 합니다.

**Bad (검증 함수 반환 불일치):**

```tsx
function checkIsNameValid(name: string): boolean { ... }
function checkIsAgeValid(age: number): { ok: boolean; reason?: string } { ... }
```

**문제점:** 동일한 검증 함수가 다른 타입을 반환하여 오류 발생 가능. `checkIsNameValid`는 실패 이유를 알 수 없습니다.

**Good (API Hook 통일):**

```tsx
// 모든 API Hook이 Query 객체 반환
function useUser() {
  return query;
}
function useServerTime() {
  return query;
}

const { data: user, isLoading: userLoading } = useUser();
const { data: serverTime, isLoading: timeLoading } = useServerTime();
```

**Good (Discriminated Union으로 통일):**

```tsx
type ValidationResult = { ok: true } | { ok: false; reason: string };

function checkIsNameValid(name: string): ValidationResult { ... }
function checkIsAgeValid(age: number): ValidationResult { ... }
```

**Discriminated Union 이점:** 컴파일러가 `ok` 값에 따라 `reason` 속성 접근을 제한하여 불필요한 오류를 사전에 방지합니다.

**🔍 검색:**

- 같은 범주의 함수들이 일관된 반환 타입을 사용하는가?
- `use*` Hook들의 반환 형태가 통일되어 있는가?
- `check*`, `validate*` 함수들의 반환 타입이 혼재되어 있는가?
- 팀원들이 각 함수의 반환값을 예측 가능하게 사용할 수 있는가?
- Discriminated Union으로 타입 안정성을 강화할 수 있는가?

### 3. 숨은 로직 드러내기

함수나 컴포넌트의 이름, 파라미터, 반환 값에 드러나지 않는 숨은 로직을 제거하여 협업자들이 동작을 정확히 예측할 수 있게 해야 합니다.

**Bad:**

```tsx
async function fetchBalance(): Promise<number> {
  const balance = await http.get<number>('...');
  logging.log('balance_fetched'); // 숨겨진 사이드이펙트!
  return balance;
}
```

**문제점:** 함수명과 반환 타입만으로는 내부의 로깅 작업을 예측할 수 없습니다. 로깅 로직에 오류가 생기면 실제 잔액 조회 기능까지 망가질 수 있습니다.

**Good:**

```tsx
async function fetchBalance(): Promise<number> {
  const balance = await http.get<number>('...');
  return balance;
}

// 호출하는 곳에서 명시적으로 로깅
<Button
  onClick={async () => {
    const balance = await fetchBalance();
    logging.log('balance_fetched'); // 명시적!
    await syncBalance(balance);
  }}
>
  계좌 잔액 갱신하기
</Button>;
```

**개선점:** 로깅 로직을 호출처로 분리하여 명시적으로 드러냅니다. fetchBalance는 순수하게 잔액만 가져오는 함수가 됩니다.

**🔍 검색:**

- 함수 시그니처로 예측 불가능한 부수 효과(side effect)가 존재하는가?
- 함수 내부에 logging, analytics, 캐싱, 상태 변경이 숨겨져 있는가?
- 함수 이름에서 예측할 수 없는 API 호출이 있는가?
- 부수 효과가 있는 getter/fetch 함수가 있는가?
- 로직 오류 발생 시 연관 없는 기능까지 영향받는 구조인가?
