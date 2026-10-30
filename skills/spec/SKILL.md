---
name: spec
description: 큰 기능이나 공용 코드·수익 로직을 건드리는 작업(tier 3)을 시작하기 전에 사용. 요구사항을 인터뷰로 확정하고 레포를 직접 읽어 1페이지 SPEC.md를 만든다. 구현은 새 세션에서 SPEC.md를 읽고 진행
argument-hint: "[기능 설명 또는 티켓 링크]"
allowed-tools: Read, Glob, Grep, Write, Bash(git log:*), Bash(git ls-files:*), AskUserQuestion
disable-model-invocation: true
---

# /spec — 구현 전 1페이지 스펙

plan mode 대신 쓰는 tier 3 진입점이다. 목표는 **다음 세션이 이 문서 하나만 읽고 끝까지 구현할 수 있는 상태**를 만드는 것. 보고서가 아니라 계약서다. 1페이지를 넘기지 않는다.

## 절차

### 1. 인터뷰 (모호하면 멈춘다)
요구사항에서 아래 중 하나라도 비어 있으면 AskUserQuestion으로 **한 번에 최대 3개**만 묻는다. 추측으로 채우지 않는다.
- 사용자에게 보이는 결과가 뭔가 (화면·동작)
- 건드리면 안 되는 것 (광고 SDK·수익 로직·공용 컴포넌트·외부 계약)
- 완료 판정 기준 (어떤 테스트·스크린샷이 있어야 끝인가)
- 범위 밖 (이번에 안 하는 것)

### 2. 레포 직접 읽기 (에이전트 띄우지 않는다)
Glob/Grep/Read로 직접 확인한다:
- 영향받는 파일과 그 파일을 import하는 곳
- 재사용할 기존 컴포넌트·훅·유틸 (새로 만들지 말 것 목록)
- CLAUDE.md의 모범 예시 파일 — 있으면 그 패턴을 따르라고 명시
- package.json에서 테스트 러너·lint 명령

### 3. SPEC.md 작성
아래 양식 그대로, 각 항목은 불릿 몇 개 수준. 코드 스케치는 인터페이스(타입·props·함수 시그니처)만 허용하고 구현은 쓰지 않는다.

```markdown
# <기능 이름>

## 목표
사용자에게 보이는 결과 1~3줄.

## 건드리는 파일
- `path/to/file.tsx` — 무엇을 바꾸는지 한 줄
- (새 파일) `path/to/New.tsx` — 역할 한 줄

## 건드리지 않는 것
- 광고 SDK 호출부, 공용 `Button`, ... (이유 한 줄)

## 재사용
- `useXxx`, `<Modal>` — 새로 만들지 말고 이걸 쓴다

## 인터페이스
```ts
type NewProps = { ... }
function useThing(): { ... }
```

## 완료 조건
- [ ] `pnpm typecheck && pnpm test` 통과
- [ ] 새 동작에 대한 테스트 N개 (무엇을 검증하는지 한 줄씩)
- [ ] 1280×800, 375×812 스크린샷에서 <무엇>이 보임, 콘솔 에러 0
- [ ] a11y: <해당 시> 버튼은 `<button>`, 입력엔 label

## 열린 질문
- 사용자 확인이 필요한 것 (없으면 "없음")
```

UI 컴포넌트가 있고 인터랙션이 복잡하면 **a11y-reviewer 하나만** 스펙 초안에 대해 돌려 "완료 조건"의 a11y 항목을 채운다. fundamentals·react 리뷰어는 코드가 생긴 뒤 `/binary-agents:fundamentals-review`에서 돈다. 여기서 돌리지 않는다.

### 4. 저장과 안내
- 프로젝트 루트에 `SPEC.md`로 저장. 이미 있으면 덮어쓰기 전에 사용자에게 묻는다.
- 마지막 출력은 이 세 줄만:
  1. `SPEC.md` 저장 위치
  2. "열린 질문"이 있으면 그 목록
  3. 다음 단계: **새 세션을 열고** `SPEC.md 읽고 구현해. 끝나면 /binary-agents:fe-verify` 라고 안내

## 하지 않는 것
- 구현 코드 작성
- Explore/Plan 에이전트 호출 — 직접 읽는다
- 9개 섹션짜리 보고서 — 1페이지
- 기존 SPEC.md 뒤에 append — 하나의 작업 = 하나의 SPEC
