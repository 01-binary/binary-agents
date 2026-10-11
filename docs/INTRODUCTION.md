# Binary Agents — AI 코드 리뷰 & 워크플로우 자동화

## 이게 뭔가요?

Claude Code에서 쓸 수 있는 **AI 서브에이전트 + 슬래시 커맨드 + 스킬** 모음입니다.

- 서브에이전트: 각자 전문 분야가 다른 **AI 코드 리뷰어 13명**
- 슬래시 커맨드: 커밋, PR, 브랜치 등 **반복 작업 자동화**
- 스킬: 코드를 쓸 때 자동으로 적용되는 **판단 기준** (4원칙, 원칙 충돌과 예외, 근본 원인, 접근성)

설치는 한 줄이면 됩니다:

```bash
npx binary-agents
```

---

## 슬래시 커맨드

### /commit — 커밋 메시지 자동 생성

기존 커밋 로그를 분석해서 프로젝트 컨벤션에 맞는 메시지를 만들어줍니다.

```bash
git add .
/commit
```

→ 커밋 히스토리 패턴 감지 → 메시지 제안 → 확인 후 커밋

### /branch — 브랜치 자동 생성

```bash
/branch
```

→ 브랜치 네이밍 컨벤션 분석 → main에서 pull → 새 브랜치 생성

### /pr — Pull Request 자동 생성

```bash
/pr
```

→ 커밋 내역 + 변경 파일 분석 → PR 제목/설명 생성 → GitHub에 PR 생성

### /review-pr — PR 코드 리뷰

PR 링크를 주면 여러 에이전트가 **동시에** 리뷰합니다.

```bash
/review-pr 123
/review-pr https://github.com/owner/repo/pull/123
```

→ PR diff 분석 → 에이전트 병렬 실행 → 심각도별 정리된 리뷰 리포트

### /code-review — 종합 코드 리뷰

PR 없이도 특정 경로의 코드를 종합 리뷰합니다.

```bash
/code-review src/components
```

→ 최대 11개 에이전트 병렬 실행 → Critical / Recommended / Best Practices로 분류

### /impact-check — 변경사항 영향 분석

git diff를 분석해서 **뭘 했는지 정리**하고 **side effect를 엄밀하게 검증**합니다.

```bash
/impact-check              # 자동 (staged 우선)
/impact-check staged       # staged만
/impact-check branch       # 브랜치 vs main
/impact-check <해시>       # 특정 커밋
```

→ 작업 내용 논리 단위 정리 → 8가지 체크리스트로 side effect 검증 → 🔴/🟡/🟢 위험도 분류 + 근거/조치 제시

### /review-comments — 리뷰 코멘트 분석

PR에 달린 리뷰 코멘트를 분석해서 뭘 고쳐야 하는지 정리해줍니다.

```bash
/review-comments
```

→ 코멘트 수집 → 현재 코드와 비교 → 🔴 개선 필요 / 🟡 논의 필요 / 🟢 조치 불필요 분류

### /fundamentals-review — Toss Fundamentals 집중 리뷰

가독성, 예측 가능성, 응집도, 결합도에 근본 원인, 접근성, 상태관리까지 병렬로 보고, 같은 문제는 하나로 묶어 원칙끼리 부딪히는 제안을 판단해 줍니다.

```bash
/fundamentals-review              # 브랜치 변경 전부 (기본)
/fundamentals-review staged       # git add 한 것만
/fundamentals-review unstaged     # git add 안 한 로컬 변경만
/fundamentals-review src/hooks    # 경로의 파일 전체
/fundamentals-review --save       # 결과를 파일로 저장
```

→ 범위 수집 → 관점별 에이전트 병렬 실행 → 이슈 단위로 합치기 + 원칙 충돌 판단 → Critical 재검증 → 원칙·루브릭 태그와 근거 한 문장을 붙여 출력

### /design-to-code — 설계 → 구현 계획

요구사항을 설명하면 코드베이스를 분석해서 구현 계획을 만들어줍니다.

```bash
# 먼저 요구사항 설명 후
/design-to-code
```

### /figma-check — 디자인 vs 구현 비교

Figma MCP로 디자인 정보를 가져와서 실제 코드와 차이를 분석합니다.

```bash
/figma-check
```

---

## 서브에이전트 (AI 리뷰어)

슬래시 커맨드가 내부적으로 사용하는 전문 리뷰어들입니다.

| 에이전트 | 전문 분야 |
|----------|-----------|
| **code-reviewer** | 아키텍처, 타입 안전성, 에러 처리, 보안, 접근성 |
| **junior-checker** | 주니어 개발자가 읽기 쉬운 코드인가? |
| **refactor-analyzer** | 중복 코드, 복잡도, 리팩토링 기회 |
| **fundamentals-readability** | 가독성 (함수 분리, 네이밍, 매직 넘버) |
| **fundamentals-predictability** | 예측 가능성 (이름 충돌, 숨은 로직) |
| **fundamentals-cohesion** | 응집도 (디렉토리 구조, 관련 코드 모음) |
| **fundamentals-coupling** | 결합도 (단일 책임, Props Drilling) |
| **react-state-reviewer** | 상태관리 (Context 오용, 서버/클라이언트 상태 분리) |
| **react-performance-optimizer** | 리렌더링, 메모이제이션, 훅 최적화 |
| **react-principles-reviewer** | React 개발 원칙 (Props 관리, 부수효과) |
| **maintainable-code-reviewer** | 유지보수성 (UI-코드 대응, 분리 원칙) |
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
/impact-check → side effect 확인 → 수정 → /commit → /pr
```

### 코드 품질 점검

```
/code-review src/components → 리포트 확인 → 개선
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
