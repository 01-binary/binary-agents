---
name: fe-readability
description: 코드를 읽기 쉽게 쓰는 기준(Toss Frontend Fundamentals 가독성). 한 컴포넌트·함수에 동시에 실행되지 않는 분기가 섞일 때, 구현 상세가 그대로 드러날 때, 복잡한 조건이나 숫자에 이름이 없을 때, 중첩 삼항이나 위아래로 오가며 읽어야 하는 코드를 쓰거나 리뷰할 때 사용
---

# 가독성 (Readability)

읽는 사람이 **한 번에 머릿속에서 고려하는 맥락이 적고**, **위에서 아래로 자연스럽게 이어지는** 코드

## 빠른 참조

| 항목 | 이런 코드면 의심 | 개선 방향 |
|---|---|---|
| 1. 같이 실행되지 않는 코드 분리하기 | 역할·권한·모드에 따라 완전히 다른 UI와 effect가 한 컴포넌트에서 분기된다. useEffect 안에 early return이 있다 | 분기별 컴포넌트로 나누고, 상위에서는 어느 쪽을 그릴지만 고른다 |
| 2. 구현 상세 추상화하기 | 한 컴포넌트에서 동시에 고려할 맥락이 6~7개를 넘는다. 인증·리다이렉트 같은 세부가 페이지에 드러나 있다. 버튼과 클릭 로직이 멀리 떨어져 있다 | 가드·Wrapper 컴포넌트로 세부를 감추고, 함께 바뀌는 코드는 가까이 둔다 |
| 3. 로직 종류에 따라 합쳐진 함수 쪼개기 | 쿼리 파라미터·상태·API 호출을 종류별로 한 훅에 모은다. 일부 값만 필요한데 전체 훅을 쓴다 | 책임 하나만 맡는 훅으로 나눈다 (예: `useCardIdQueryParam`) |
| 4. 복잡한 조건에 이름 붙이기 | 여러 줄에 걸친 조건식, 여러 곳에서 반복되는 조건 | `const isPriceInRange = ...`처럼 의도를 이름으로 드러낸다 |
| 5. 매직 넘버에 이름 붙이기 | 의도를 알 수 없는 숫자(300, 1000), 하드코딩된 상태 코드 | 목적이 드러나는 상수명 (예: `ANIMATION_DELAY_MS`) |
| 6. 시점 이동 줄이기 | 조건 하나를 파악하려고 함수·파일·변수를 3번 이상 넘나든다 | 조건을 펼쳐 쓰거나, 한눈에 보이는 객체로 둔다 |
| 7. 삼항 연산자 단순하게 하기 | 2단계 이상 중첩된 삼항, 삼항 안의 `&&`·`||` | if 문, early return, 즉시 실행 함수로 푼다 |
| 8. 비교 순서 자연스럽게 하기 | `a >= min && a <= max` | `min <= a && a <= max`처럼 부등식 순서로 |

## 판단 기준

- **조건 이름**: 여러 줄에 걸치거나, 여러 곳에서 반복되거나, 단위 테스트가 필요하면 이름을 붙인다. 매우 간단하거나 한 번만 쓰이면 붙이지 않아도 된다.
- **시점 이동 해법**: 경우의 수가 적으면 조건을 펼쳐 쓰고(switch), 정책이 여러 개면 한눈에 보이는 객체로 둔다. 정책 객체가 다른 파일에 있어 점프가 늘면 오히려 나빠진다.
- **맥락의 수**: 한 사람이 동시에 고려할 수 있는 맥락은 6~7개 정도다. 분리할지는 줄 수가 아니라 한 번에 들고 있어야 하는 맥락의 수로 판단한다.

## 함께 볼 코드 스멜

| 신호 | 개선 방향 |
|---|---|
| 파라미터가 4개 이상 | 이름이 있는 객체 파라미터로 묶는다 |
| 함수가 50줄, 파일이 300줄을 넘는다 | 같이 실행되지 않는 코드나 다른 책임을 나눈다 |
| 중첩이 3단계 이상 | early return과 가드 절로 평탄하게 만든다 |

수치는 신호일 뿐이다. 나눌지는 한 번에 고려할 맥락의 수와 `fe-tradeoffs` 기준으로 정한다.

## Red Flags (발견 즉시 Critical)

- **중첩 삼항 연산자 2단계 이상**: 즉시 if-else 또는 IIFE로 변환
- **매직 넘버가 여러 파일에 하드코딩**: 타이밍/사이즈 값이 파일 간 분산
- **시점 이동 3단계 이상**: 로직 파악을 위해 3개 이상 파일/함수 점프 필요
- **하나의 Hook이 5개 이상 상태 관리**: God Hook, 불필요한 리렌더링 유발
- **맥락 6-7개 초과**: 한 컴포넌트에서 동시에 고려해야 할 맥락이 과도

## 다른 원칙과 부딪히는 지점

가독성 개선이 다른 원칙과 상충할 수 있습니다:

- **가독성 vs 응집도**: 추상화를 줄이면 읽기 쉽지만, 함께 수정되어야 할 코드가 분산될 수 있음
- **가독성 vs DRY**: 2개 정도의 유사 코드는 과도한 추상화보다 직접 읽히는 게 나을 수 있음

원칙끼리 부딪히면 `fe-tradeoffs` 스킬의 판단 기준을 따른다.

## 예시 코드

항목별 상세 설명, Bad/Good 코드, 확인 질문은 [references/examples.md](references/examples.md)에 있다. 개선안을 코드로 제시할 때 참고한다.

## 출처

- [같이 실행되지 않는 코드 분리하기](https://frontend-fundamentals.com/code-quality/code/examples/submit-button.html)
- [구현 상세 추상화하기](https://frontend-fundamentals.com/code-quality/code/examples/login-start-page.html)
- [로직 종류에 따라 합쳐진 함수 쪼개기](https://frontend-fundamentals.com/code-quality/code/examples/use-page-state-readability.html)
- [복잡한 조건에 이름 붙이기](https://frontend-fundamentals.com/code-quality/code/examples/condition-name.html)
- [매직 넘버에 이름 붙이기](https://frontend-fundamentals.com/code-quality/code/examples/magic-number-readability.html)
- [시점 이동 줄이기](https://frontend-fundamentals.com/code-quality/code/examples/user-policy.html)
- [삼항 연산자 단순하게 하기](https://frontend-fundamentals.com/code-quality/code/examples/ternary-operator.html)
- [비교 순서 자연스럽게 하기](https://frontend-fundamentals.com/code-quality/code/examples/comparison-order.html)
