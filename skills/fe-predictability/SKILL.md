---
name: fe-predictability
description: 이름과 시그니처만 보고 동작을 예측할 수 있게 쓰는 기준(Toss Frontend Fundamentals 예측 가능성). 함수·훅·모듈 이름을 짓거나, 라이브러리와 같은 이름으로 감싸거나, 같은 종류 함수의 반환 형태를 정하거나, get·fetch 함수에 로깅·저장 같은 부수효과를 넣으려 할 때 사용
---

# 예측 가능성 (Predictability)

함께 협업하는 동료들이 함수나 컴포넌트의 **이름과 파라미터, 반환 값만 보고도 어떤 동작을 하는지 알 수 있는** 코드. 같은 이름을 가진 함수는 동일한 동작을 해야 하고, 같은 종류의 함수는 일관된 반환 타입을 가져야 하며, 시그니처로 예측할 수 없는 숨은 로직이 없어야 합니다.

## 빠른 참조

| 항목 | 이런 코드면 의심 | 개선 방향 |
|---|---|---|
| 1. 이름 겹치지 않게 관리하기 | 라이브러리와 같은 이름(`http`)으로 감싸면서 토큰 조회 같은 동작을 더한다. 같은 이름의 함수가 서로 다르게 동작한다 | 라이브러리와 구분되는 이름에 동작을 드러낸다 (예: `httpService.getWithAuth`) |
| 2. 같은 종류의 함수는 반환 타입 통일하기 | 같은 종류의 API 훅 중 일부는 Query 객체, 일부는 data만 반환한다. 검증 함수가 boolean과 객체를 섞어 반환한다 | 같은 형태로 통일한다. 검증 결과는 Discriminated Union (`{ ok: true } | { ok: false; reason }`) |
| 3. 숨은 로직 드러내기 | get·fetch 함수 안에 로깅, 분석 이벤트, 캐싱, 상태 변경이 숨어 있다 | 부수효과는 호출하는 쪽에서 명시적으로 실행한다 |

## 판단 기준

- **부수효과는 지우지 말고 옮긴다**: 로깅 같은 부수효과를 없애는 게 아니라, 이름이 약속하는 범위 밖으로 꺼내 호출부에서 보이게 한다.
- **Discriminated Union**: `ok` 값에 따라 `reason` 접근을 컴파일러가 막아 주므로, 같은 종류의 결과 타입을 통일할 때 우선 고려한다.
- **기존 계약 유지**: 이름이나 반환 형태를 바꾸는 제안은 사용처 전체가 바뀌므로 영향 범위를 함께 적는다.

## Red Flags (발견 즉시 Critical)

- **숨은 사이드이펙트**: fetch/get 함수 내 logging, analytics, mutation — 로깅 오류가 기능 장애로 전파될 수 있음
- **이름 충돌**: 라이브러리와 동일한 이름으로 래핑하면서 동작이 다른 함수 — 단순 GET으로 예상하지만 인증 로직 포함
- **반환 타입 불일치**: 같은 접두사(use*, check*, validate\*) 함수 그룹의 불일치 — 사용자가 매번 내부 구현 확인 필요

## 다른 원칙과 부딪히는 지점

예측 가능성 개선이 다른 원칙과 상충할 수 있습니다:

- **예측 가능성 vs 편의성**: 숨은 로직(자동 로깅 등)을 제거하면 호출부마다 명시적으로 추가해야 해서 코드량이 늘어남
- **예측 가능성 vs 응집도**: 부수효과를 밖으로 꺼내면 관련 로직이 분산될 수 있음

원칙끼리 부딪히면 `fe-tradeoffs` 스킬의 판단 기준을 따른다.

## 예시 코드

항목별 상세 설명, Bad/Good 코드, 확인 질문은 [references/examples.md](references/examples.md)에 있다. 개선안을 코드로 제시할 때 참고한다.

## 출처

- [이름 겹치지 않게 관리하기](https://frontend-fundamentals.com/code-quality/code/examples/http.html)
- [같은 종류의 함수는 반환 타입 통일하기](https://frontend-fundamentals.com/code-quality/code/examples/use-user.html)
- [숨은 로직 드러내기](https://frontend-fundamentals.com/code-quality/code/examples/hidden-logic.html)
