# Binary Agents — AI 코드 리뷰 & 워크플로우 자동화

## 이게 뭔가요?

Claude Code에서 쓸 수 있는 **AI 서브에이전트 + 슬래시 커맨드 + 스킬** 모음입니다.

- 서브에이전트: 각자 전문 분야가 다른 **AI 코드 리뷰어 8명**
- 슬래시 커맨드: 커밋, PR, 브랜치 등 **반복 작업 자동화**
- 스킬: 코드를 쓸 때 자동으로 적용되는 **판단 기준** (4원칙, 원칙 충돌과 예외, 근본 원인, 접근성, 상태 배치, React 컴포넌트 패턴)

설치는 한 줄이면 됩니다:

```bash
npx binary-agents@latest
```

설치할 때마다 패키지 내용과 똑같이 맞춰서, 패키지에서 빠진 예전 파일은 지우고 직접 만든 파일은 그대로 둡니다.

---

## 슬래시 커맨드

### /commit — 커밋 메시지 자동 생성

기존 커밋 로그를 분석해서 프로젝트 컨벤션에 맞는 메시지를 만들어줍니다.

```bash
git add .
/commit
```

→ 커밋 히스토리 패턴 감지 → 섞인 변경은 나누는 안 제시 → 메시지 제안 → 확인 후 커밋

### /branch — 브랜치 자동 생성

```bash
/branch
/branch --from develop 결제 수정
```

→ 기준 브랜치 자동 감지(또는 `--from`) → 네이밍 컨벤션 분석 → 기준 브랜치 최신화 → 새 브랜치 생성

### /pr — Pull Request 자동 생성

```bash
/pr
```

→ 커밋 내역 + 변경 파일 분석 → PR 제목/설명 생성 → GitHub에 PR 생성

### /review-comments — 리뷰 코멘트 분석

PR에 달린 리뷰 코멘트를 분석해서 뭘 고쳐야 하는지 정리하고, 논의가 필요한 코멘트에는 답글 초안을 써줍니다.

```bash
/review-comments
/review-comments 123
```

→ resolve 안 된 스레드 수집 → 현재 코드와 비교 → `fe-*` 스킬 기준으로 🔴 개선 필요 / 🟡 논의 필요 / 🟢 조치 불필요 분류 → 🟡에 답글 초안

### /fundamentals-review — Toss Fundamentals 집중 리뷰

가독성, 예측 가능성, 응집도, 결합도에 근본 원인, 접근성, 상태관리, React 패턴까지 병렬로 보고, 같은 문제는 하나로 묶어 원칙끼리 부딪히는 제안을 판단해 줍니다.

```bash
/fundamentals-review              # 브랜치 변경 전부 (기본)
/fundamentals-review staged       # git add 한 것만
/fundamentals-review unstaged     # git add 안 한 로컬 변경만
/fundamentals-review src/hooks    # 경로의 파일 전체
/fundamentals-review --save       # 결과를 파일로 저장
```

→ 범위 수집 → 관점별 에이전트 병렬 실행 → 이슈 단위로 합치기 + 원칙 충돌 판단 → Critical과 라이브러리 동작 주장 검증 → 이슈마다 문제·현재 코드·수정 코드·해결·확인을 짧게 출력

### /design-to-code — 설계 → 구현 계획

요구사항을 설명하면 코드베이스를 분석해서 구현 계획을 만들어줍니다.

```bash
# 먼저 요구사항 설명 후
/design-to-code
```

---

## 서브에이전트 (AI 리뷰어)

슬래시 커맨드가 내부적으로 사용하는 전문 리뷰어들입니다.

| 에이전트 | 전문 분야 |
|----------|-----------|
| **fundamentals-readability** | 가독성 (함수 분리, 네이밍, 매직 넘버) |
| **fundamentals-predictability** | 예측 가능성 (이름 충돌, 숨은 로직) |
| **fundamentals-cohesion** | 응집도 (디렉토리 구조, 관련 코드 모음) |
| **fundamentals-coupling** | 결합도 (단일 책임, Props Drilling) |
| **react-state-reviewer** | 상태관리 (Context 오용, 서버/클라이언트 상태 분리) |
| **react-principles-reviewer** | React 컴포넌트 패턴 (데이터 소유, 부수효과 위치, 데이터 Fetching·비동기 경계, 네이밍, 메모이제이션) |
| **root-cause-reviewer** | 근본 원인 (증상을 덮는 코드, 에러 처리, 비동기 경쟁, 데드코드) |
| **a11y-reviewer** | 접근성 (클릭 가능한 div, 폼, 요소 중첩, 아이콘 버튼, 레이블) |

---

## 스킬 (판단 기준)

Claude가 관련 코드를 쓸 때 자동으로 불러오고, 리뷰 에이전트도 기준으로 씁니다.

| 스킬 | 내용 |
|------|------|
| **fe-readability** | 가독성 8가지 (분리, 추상화, 이름 붙이기, 시점 이동, 삼항, 비교 순서) |
| **fe-predictability** | 예측 가능성 3가지 (이름 충돌, 반환 타입 통일, 숨은 로직) |
| **fe-cohesion** | 응집도 3가지 (디렉토리, 매직 넘버 상수, 폼) |
| **fe-coupling** | 결합도 3가지 (책임 분리, 중복 허용, Props Drilling) |
| **fe-tradeoffs** | 4원칙이 부딪힐 때 판단 기준, 원칙을 깨도 되는 경우, 하지 말아야 할 제안 |
| **fe-root-cause** | 진단 → 재현 → 수정 → 재발 방지, 증상 덮기 vs 근본 원인 수정, 순수 함수 분리, 데드코드 |
| **fe-a11y** | 접근성 6가지 패턴, ESLint로 넘길 범위 |
| **fe-react** | 컴포넌트 데이터 소유, 부수효과 위치, 데이터 Fetching·비동기 경계, 네이밍, 메모이제이션 |
| **fe-state** | 상태를 어디에 둘지 (useState·합성·Context·전역 스토어·서버 상태·URL) |

---

## 실제 사용 흐름

### 일상적인 개발

```
코드 작성 → git add → /commit → /pr
```

### PR 리뷰 받았을 때

```
/review-comments → 뭘 고쳐야 하는지 확인 → 수정 → /commit
```

### 커밋/PR 전 셀프 체크

```
/fundamentals-review staged → 리포트 확인 → 수정 → /commit → /pr
```

### 코드 품질 점검

```
/fundamentals-review src/components → 리포트 확인 → 개선
```

### 새 기능 시작

```
/branch → 요구사항 설명 → /design-to-code → 구현 → /commit → /pr
```

---

## 구조

```
binary-agents/
├── agents/     ← AI 리뷰어 정의 (마크다운 파일)
├── commands/   ← 슬래시 커맨드 정의 (마크다운 파일)
├── skills/     ← 스킬 정의 (SKILL.md + 부속 파일)
├── src/        ← 설치 도구 (sync engine)
└── bin/        ← CLI 진입점
```

에이전트와 커맨드는 전부 **마크다운 파일 하나**로, 스킬은 **SKILL.md가 든 폴더 하나**로 정의됩니다.
코드를 안 짜도 새 에이전트를 만들 수 있습니다.
