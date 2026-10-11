---
name: fe-root-cause
description: 버그를 고치거나 리뷰할 때 사용. 값이 없거나 타입이 다를 수 있는데 as·!·기본값으로 덮으려 할 때, 비동기 응답 순서 문제를 디바운스로만 막으려 할 때, 컴포넌트에 섞인 계산 로직을 빼거나 끝난 실험 분기·안 쓰는 코드를 정리할 때. Toss Frontend Fundamentals 디버깅 가이드 기반
---

# 근본 원인으로 고치기

디버깅은 **진단 → 재현 → 수정 → 재발 방지** 순서로 한다. 겉으로 드러난 증상만 고치면 버그는 다시 나타난다.

| 단계 | 핵심 |
|---|---|
| 진단 | 에러 메시지의 종류와 맥락을 읽고, 동작 순서를 단계로 나눠 기대 결과와 실제 결과가 갈리는 지점을 찾는다 |
| 재현 | 핵심 로직만 남긴 최소 코드로, 경계값·극단값·빠른 반복 입력으로 버그를 일부러 만든다 |
| 수정 | 잘못된 가정 자체를 고친다. 아래 1~3이 수정 단계의 기준이다 |
| 재발 방지 | 같은 실수가 다시 들어오지 못하게 타입, 테스트, 공통 코드, 린트 중 하나로 막는다 |

## 1. 증상을 덮는 수정 vs 근본 원인 수정

### 값이 없을 수 있는데 덮는 경우

```ts
// ❌ 증상을 덮는 수정: "값이 반드시 있다"는 잘못된 가정이 그대로 남는다
const user = users.find((u) => u.id === id) as User;  // 타입 에러만 지움, 런타임 TypeError는 그대로
const user = users.find((u) => u.id === id)!;         // 같음
const user = users.find((u) => u.id === id) || {};    // 잘못된 데이터가 조용히 화면까지 흘러감

// ✅ 없을 때를 명시적으로 처리한다
const user = users.find((u) => u.id === id);
if (!user) throw new Error(`사용자를 찾을 수 없음: ${id}`);   // 또는 화면에서 "없음" 상태로 처리
```

같은 계열:
- 서버 응답 제네릭 단언(`request<Order[]>`)과 `data || []` 폴백. 응답 형태가 다르면 폴백이 원인을 가려서 엉뚱한 곳에서 터진다.
- `order.memo || ''`처럼 필드마다 붙인 폴백. 상위에서 "데이터가 없거나 잘못됨"을 처리하지 않았다는 신호일 수 있다.

### 응답 순서가 꼬이는 경우

```ts
// ❌ 디바운스만 추가: 대기 중인 타이머는 취소하지만 이미 출발한 요청은 못 막는다
// ✅ 이전 요청을 취소하거나 응답 순서를 관리한다
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(setResults)
    .catch((err) => {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err);
    });
  return () => controller.abort();
}, [query]);
```

- `fetch`는 4xx·5xx에서 reject하지 않는다. `res.ok`를 확인하지 않으면 에러 응답이 성공 데이터로 처리된다. TanStack Query의 `queryFn`도 throw해야 error 상태가 된다.
- TanStack Query를 쓰면 쿼리 키마다 캐시가 따로 있고 `queryFn`에 `signal`이 전달된다. 직접 `useEffect`로 요청을 관리하는 코드는 이것부터 의심한다.
- `catch`에서 `console.error`만 하고 끝내면 사용자는 실패를 모른다. 에러를 화면 상태로 올린다.

## 2. 비즈니스 로직을 순수 함수로 분리

```tsx
// ❌ 할인 계산이 컴포넌트 안에 있어서, 테스트하려면 화면을 렌더링해야 한다
const discount = total >= 50000 ? total * rate : 0;

// ✅ 순수 함수로 빼서 금액별로 바로 테스트한다
export function calculateDiscount(total: number, rate: number) {
  return total >= 50000 ? total * rate : 0;
}
```

- `useEffect` 안에 저장소 접근, 날짜 계산, 상태 변경이 섞여 있으면 유틸 함수와 커스텀 훅으로 나눈다.
- `localStorage`나 `new Date()`에 직접 의존하면 엄밀히는 순수 함수가 아니다. 저장값과 오늘 날짜를 인자로 받게 하면 테스트가 쉬워진다.
- 순수 함수로 빼는 이유는 **고친 버그가 다시 나지 않게 테스트로 고정**하기 위해서다.

## 3. 데드코드 정리

- 이번 변경으로 호출하는 곳이 없어진 export, 유틸, CSS 클래스가 남았는지 본다. 도구: `knip`, `ts-prune`, `stylelint-no-unused-selectors`(런타임에만 붙는 클래스는 잘못 잡을 수 있음).
- A/B 테스트나 기능 플래그 실험이 끝났으면 채택안만 남기고 분기를 지운다. 남아 있으면 디버깅할 때 이미 안 쓰는 분기를 따라가게 된다.
- 당장 못 지우면 `@deprecated`에 제거 시점, 사유, 대체 여부를 적고, 실험 분기에는 어느 안으로 끝났는지 TODO를 남긴다.
- 설치만 되고 쓰지 않는 의존성, 같은 역할의 패키지 중복(예: 같은 라이브러리의 다른 버전)도 같은 부채다.

## 4. 사례에서 나온 위험 패턴

자세한 증상과 원인은 [references/cases.md](references/cases.md)에 있다.

| 패턴 | 위험 |
|---|---|
| 서버 응답을 제네릭으로 단언하고 빈 값 폴백 | 형태가 달라도 조용히 통과했다가 다른 곳에서 터진다 |
| react-hook-form에서 `handleSubmit(onSubmit)`만 있음 | 검증이 실패하면 아무 반응이 없다 |
| 같은 라이브러리의 버전 중복 | 내부 상태(레이어 스택 등)가 둘로 나뉘어 상호작용이 깨진다 |
| 중복 실행 방지를 state로만 함 | 반영 전이나 옛 클로저에서 요청이 중복된다 → ref 가드 |
| interval, 리스너, WebSocket cleanup 누락 | 언마운트 후에도 살아서 메모리가 샌다 |
| Suspense 경계가 레이아웃 바깥 | suspend할 때 레이아웃까지 언마운트되어 상태가 날아간다 |
| 큰 ID를 `Number()`로 변환 | 2^53 − 1을 넘으면 정밀도가 손실된다 → ID는 문자열로 유지 |
| 웹뷰 여러 개가 쿼리 캐시를 공유 | 한 곳에서 지워진 쿼리가 다른 곳으로 전파된다 |

## 리뷰에 적용하는 법

각 지적은 **증상 → 근본 원인(잘못된 가정) → 수정 → 재발 방지** 순서로 한 줄씩 쓴다.

> 예) 검색어를 빠르게 바꾸면 늦게 온 이전 응답이 최신 결과를 덮는다(증상). 응답 순서를 관리하지 않는 게 원인이고, 디바운스는 이미 출발한 요청을 못 막는다(원인). AbortController로 이전 요청을 취소한다(수정). 요청 취소를 공통 훅으로 모으고 연속 입력 테스트를 남긴다(재발 방지).

## 출처

- [효과적인 디버깅을 위한 4가지 단계](https://frontend-fundamentals.com/debug/pages/start.html)
- [근본 원인 수정하기](https://frontend-fundamentals.com/debug/pages/fix/correct.html)
- [순수 함수 분리하기](https://frontend-fundamentals.com/debug/pages/fix/pure.html)
- [데드코드 제거하기](https://frontend-fundamentals.com/debug/pages/fix/dead-code.html)
