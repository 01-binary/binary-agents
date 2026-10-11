---
name: fe-state
description: React 상태를 어디에 둘지 정하는 기준. useState·props·컴포넌트 합성·Context·전역 스토어·서버 상태(TanStack Query 등)·URL 중 무엇을 쓸지 정할 때, Context나 전역 스토어를 새로 만들려 할 때, 서버 데이터를 useState와 useEffect로 다루려 할 때 사용
---

# React 상태 배치

상태는 **수명**(페이지를 옮겨도 살아 있어야 하나), **공유 범위**(관련 없는 컴포넌트끼리도 쓰나), **변경 빈도**(자주 바뀌나)로 분류하면 쓸 도구가 정해진다. 가장 단순한 것부터 시도하고, 진짜 필요할 때만 한 단계씩 올라간다.

## 빠른 참조: 상태 성질로 도구 고르기

| 상태 | 수명 / 범위 / 빈도 | 도구 |
|---|---|---|
| 서버 데이터 | 길다/넓다/다양 | React Query / SWR |
| 인증/테마/언어 | 길다/넓다/거의 없음 | Context API |
| 장바구니 | 길다/넓다/자주 | Zustand / Redux |
| 라우팅/검색 필터 | 길다/넓다/다양 | URL 파라미터 |
| 폼 입력 | 짧다/좁다/자주 | useState / React Hook Form |
| UI 토글 | 짧다/좁다/가끔 | useState |

## 5단계 에스컬레이터 (판단 순서)

```
상태가 필요해!
    │
    ├─ 이 컴포넌트에서만 쓴다
    │   └→ useState
    │
    ├─ 자식 1~2단계에서 쓴다
    │   └→ prop drilling (의존성이 눈에 보이는 장점)
    │
    ├─ 3단계+ 인데 중간이 안 쓴다
    │   └→ 컴포넌트 합성 먼저 시도
    │       ├─ 해결 → 끝!
    │       └─ 안 됨 → 다음으로
    │
    ├─ 넓게 퍼져있고 + 드물게 바뀐다
    │   └→ Context API (DI 목적으로)
    │
    └─ 넓게 퍼져있고 + 자주 바뀐다
        └→ Zustand / Redux (부분 구독 필수)
```

- 1~2단계 prop 전달은 의존성이 눈에 보이는 장점이 있어 그대로 둬도 된다.
- prop drilling을 피하려는 목적만으로 전역 상태를 쓰지 않는다. 먼저 컴포넌트 합성(children, 슬롯 props)을 시도한다.

## Context는 상태관리 도구가 아니다

Context는 값을 트리 아래로 전달하는 **의존성 주입(DI) 파이프**다. 상태를 실제로 들고 있는 건 useState·useReducer다.

| 요건 | Context API | Zustand/Redux |
| --- | --- | --- |
| 값을 저장한다 | ❌ useState가 저장 | ✅ store가 저장 |
| 값을 읽는다 | ✅ useContext | ✅ selector |
| 값을 업데이트한다 | ❌ 자체 방법 없음 | ✅ action/dispatch |
| 변경을 알린다 | △ 전부 리렌더 | ✅ 구독자만 리렌더 |

- 쓰기 좋은 곳: 인증·테마·언어·설정처럼 드물게 바뀌고 넓게 쓰이는 값
- 쓸 때 지킬 것: 관심사별로 Context를 나누고(State / Dispatch / Config), Provider 값은 `useMemo`로 감싼다
- 피할 것: 자주 바뀌는 값(장바구니, 검색 입력)을 넣거나, 여러 관심사를 한 Context에 묶기 — 하나만 바뀌어도 전부 리렌더된다

## 서버 상태와 클라이언트 상태

서버 데이터는 캐싱·무효화·재요청·동기화가 필요하다. useState와 useEffect로 직접 관리하지 말고 TanStack Query·SWR 같은 서버 상태 도구에 맡긴다. 서버 데이터를 전역 스토어에 복사해 두는 것도 같은 문제다.

## 전역 스토어

전역 스토어는 "모든 상태의 창고"가 아니다. 자주 바뀌고 넓게 퍼진 값에만 쓰고, selector로 필요한 값만 구독한다(`useStore((s) => s.total)`). 모달 열림, 한 페이지에서만 쓰는 값은 로컬 상태로 충분하다.

## props로 넘길까, 안에서 관리할까

**핵심 질문: "상위에서 그 값을 알아야 하는 이유가 있는가?"**

| 상황                          | 결론              | 예시                                      |
| ----------------------------- | ----------------- | ----------------------------------------- |
| 상위에서 조건부 렌더링에 사용 | props로 전달      | `isLoggedIn`일 때만 Dashboard 표시        |
| 상위에서 직접 사용하지 않음   | 내부에서 관리     | 드롭다운 열림 상태는 해당 컴포넌트만 사용 |
| 여러 컴포넌트가 공유 필요     | 상위로 끌어올리기 | 선택된 탭을 Header와 Content가 공유       |

같은 값을 여러 컴포넌트가 각자 읽어도 되는지는 그 값이 어디에 저장되는지에 달려 있다.

| 상태 저장소     | 여러 컴포넌트에서 호출 시        | 응집도 우선 가능? |
| --------------- | -------------------------------- | ----------------- |
| URL query param | 같은 URL 읽음 -> 자동 공유       | 가능              |
| Context         | 같은 Context 읽음 -> 자동 공유   | 가능              |
| localStorage    | 같은 키 읽음 -> 자동 공유        | 가능              |
| 내부 useState   | 각자 별도 인스턴스 -> 공유 안 됨 | 공유 필요 시 불가 |

## 심각도 기준

**심각도 분류 기준:**
- **Critical** (즉시 수정): 서버 데이터를 useState+useEffect로 관리, Context에 자주 바뀌는 상태 묶어넣기, 전체 store 구독으로 인한 대규모 리렌더
- **Recommended Improvements** (권장 개선): 컴포넌트 합성으로 해결 가능한 prop drilling, URL로 옮겨야 할 검색/필터 상태, 전역 스토어의 불필요한 상태
- **Best Practices Found** (잘하고 있음): 상태 성질에 맞는 도구 사용, 적절한 Context 분할, Selector를 활용한 부분 구독

## Red Flags

**Critical 상태관리 이슈:**
- 서버 데이터를 useState + useEffect로 직접 관리 (캐시/무효화/레이스 컨디션 위험)
- 하나의 Context에 여러 관심사 묶기 (전부 리렌더)
- 전역 스토어를 Selector 없이 전체 구독
- 자주 바뀌는 상태를 Context로 관리 (부분 구독 불가)

**구조적 문제:**
- 모든 상태가 최상위로 끌어올려져 있음 (God Component)
- prop drilling을 피하려고만 전역 상태 사용 (합성 패턴 부재)
- 서버 상태와 클라이언트 상태 경계 없음
- URL에 반영되어야 할 상태가 메모리에만 존재 (새로고침 시 유실)

## 다른 원칙과 부딪히는 지점

- Props Drilling 대응은 `fe-coupling`과 같은 순서다: props가 역할을 표현하는지 보고 → 합성 → Context는 최후 수단.
- "상태를 전부 전역 스토어로 옮기기"는 `fe-tradeoffs`의 하지 말아야 할 제안이다.
- 원칙끼리 부딪히면 `fe-tradeoffs` 스킬의 판단 기준을 따른다.

## 예시 코드

원칙별 상세 설명(6번: props로 넘길지 안에서 관리할지 포함), 안티패턴과 Bad/Good 코드, 확인할 Grep 패턴은 [references/examples.md](references/examples.md)에 있다.

## 출처

- [toss/frontend-fundamentals Discussion #5](https://github.com/toss/frontend-fundamentals/discussions/5)
- [Mark Erikson — Why React Context is Not a State Management Tool](https://blog.isquaredsoftware.com/2021/01/blogged-answers-why-react-context-is-not-a-state-management-tool-and-why-it-doesnt-replace-redux/)
- [TestDouble — React Context for Dependency Injection](https://testdouble.com/insights/react-context-for-dependency-injection-not-state-management)
- [developerway — React State Management in 2025](https://www.developerway.com/posts/react-state-management-2025)
- [TkDodo — React Query and React Context](https://tkdodo.eu/blog/react-query-and-react-context)
- [React Official Docs — Managing State](https://react.dev/learn/managing-state)
