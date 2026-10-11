# Binary Agents

Claude Code 서브에이전트, 슬래시 명령어, 스킬 컬렉션 + 동기화 도구

## 소개

`binary-agents`는 Claude Code의 서브에이전트, 슬래시 명령어, 스킬을 모아놓은 모노레포입니다. Toss Frontend Fundamentals 기반 코드 리뷰와 설계 검증 서브에이전트, 자동 커밋/PR 생성 등의 슬래시 명령어, 코드를 쓸 때 자동으로 적용되는 스킬을 제공하며, 이를 프로젝트에 쉽게 설치할 수 있는 CLI 도구를 포함합니다.

## 사용법

```bash
# 대화형 설치 (권장)
npx binary-agents

# 목록 보기
npx binary-agents list
```

실행하면 대화형으로 설치 옵션을 선택할 수 있습니다:

```
🤖 Binary Agents 설치

? 어디에 설치하시겠습니까?
❯ 전역 (~/.claude/)
  현재 프로젝트 (.claude/)

? 무엇을 설치하시겠습니까?
❯ 모두 (에이전트 + 명령어 + 스킬)
  에이전트만 (에이전트가 쓰는 스킬 포함)
  명령어만
  스킬만

? 기존 binary-agents 파일을 삭제하고 새로 설치할까요?
❯ 예 (binary-agents 파일만 삭제, 커스텀 파일 보존)
  아니오 (기존 파일 유지)
```

## 서브에이전트 종류

| 이름 | 설명 |
|------|------|
| `refactor-analyzer` | 코드 중복, 복잡성, 추상화 기회, 코드 스멜 분석 |
| `fundamentals-readability` | Toss Fundamentals - 가독성 (코드 분리, 추상화, 함수 쪼개기, 조건 네이밍, 매직 넘버) |
| `fundamentals-predictability` | Toss Fundamentals - 예측 가능성 (이름 충돌, 반환 타입 통일, 숨은 로직) |
| `fundamentals-cohesion` | Toss Fundamentals - 응집도 (디렉토리 구조, 매직 넘버 관리, 폼 응집도) |
| `fundamentals-coupling` | Toss Fundamentals - 결합도 (단일 책임, 중복 코드 허용, Props Drilling) |
| `react-state-reviewer` | React 상태관리 리뷰 (상태 성질 기반 배치, Context 오용, 5단계 에스컬레이터) |
| `react-principles-reviewer` | React 개발 원칙 (응집도/명시성, Props 관리, 네이밍, 부수효과, AsyncBoundary) |
| `root-cause-reviewer` | Toss Fundamentals - 근본 원인 (증상을 덮는 코드, 에러 처리, 비동기 경쟁, cleanup, 순수 함수 분리, 데드코드) |
| `a11y-reviewer` | Toss Fundamentals - 접근성 (클릭 가능한 div, 폼과 버튼 type, 요소 중첩, 아이콘 버튼, 입력 레이블, 테이블 행 클릭) |
| `subagent-builder` | 커스텀 서브에이전트 빌더 |

## 스킬

스킬은 판단 기준을 담은 지식 묶음입니다. Claude가 관련 코드를 작성할 때 설명(description)을 보고 자동으로 불러오고, 리뷰 에이전트도 frontmatter의 `skills`로 미리 불러와 기준으로 씁니다.

| 이름 | 설명 | 쓰는 에이전트 |
|------|------|--------------|
| `fe-readability` | 가독성 8가지: 같이 실행되지 않는 코드 분리, 구현 상세 추상화, 함수 쪼개기, 조건·매직 넘버 이름, 시점 이동, 삼항, 비교 순서 | `fundamentals-readability` |
| `fe-predictability` | 예측 가능성 3가지: 이름 겹치지 않게, 반환 타입 통일, 숨은 로직 드러내기 | `fundamentals-predictability` |
| `fe-cohesion` | 응집도 3가지: 함께 수정되는 파일 같은 폴더, 매직 넘버 상수, 폼 응집도 | `fundamentals-cohesion` |
| `fe-coupling` | 결합도 3가지: 책임 하나씩, 중복 코드 허용, Props Drilling 지우기 | `fundamentals-coupling` |
| `fe-tradeoffs` | 4원칙이 부딪힐 때의 판단 기준, 원칙을 깨도 되는 경우, 하지 말아야 할 제안, 추상화를 볼 때 세 가지 질문 | fundamentals 4개, `/fundamentals-review` |
| `fe-root-cause` | 진단 → 재현 → 수정 → 재발 방지, 증상 덮기와 근본 원인 수정 구분, 순수 함수 분리, 데드코드, 디버깅 사례 8개 | `root-cause-reviewer` |
| `fe-a11y` | 접근성 6가지 패턴과 ESLint(jsx-a11y)로 넘길 범위 | `a11y-reviewer` |

## 슬래시 명령어

| 명령어 | 설명 |
|--------|------|
| `/commit` | git log 분석 후 컨벤션에 맞는 커밋 메시지 자동 생성 및 커밋 |
| `/branch` | main에서 pull 후 브랜치 네이밍 컨벤션에 맞는 새 브랜치 생성 |
| `/pr` | 브랜치 변경사항 분석 후 PR 자동 생성 |
| `/fundamentals-review` | Toss Fundamentals 4원칙 + 근본 원인 + 접근성 + 상태관리 리뷰를 병렬 실행하고 이슈 단위로 합쳐 원칙 충돌까지 판단 |
| `/design-to-code` | 설계/요구사항을 분석하여 구현 계획 생성 |
| `/review-comments` | 현재 브랜치 PR의 리뷰 코멘트를 분석하여 개선 필요 여부 판단 및 변경 방법 제시 |

### /commit 사용법

```bash
# 1. 변경 사항 스테이징
git add .

# 2. Claude Code에서 /commit 실행
/commit
```

Claude가 자동으로:
1. 최근 커밋 로그에서 컨벤션 분석
2. staged changes 확인
3. 컨벤션에 맞는 커밋 메시지 생성
4. 커밋 실행

### /branch 사용법

```bash
# Claude Code에서 /branch 실행
/branch
```

Claude가 자동으로:
1. 기존 브랜치 이름에서 컨벤션 분석
2. main 브랜치에서 최신 코드 pull
3. 작업 목적에 맞는 브랜치 이름 생성 (feature/, fix/, chore/ 등)
4. 새 브랜치 생성 및 전환

### /pr 사용법

```bash
# Claude Code에서 /pr 실행
/pr
```

Claude가 자동으로:
1. 현재 브랜치와 main 브랜치 차이 분석
2. 커밋 내역 및 변경 파일 확인
3. PR 제목 및 설명 생성
4. GitHub CLI로 PR 생성

### /fundamentals-review 사용법

```bash
# 브랜치 변경 전부 (기본): main에서 갈라진 뒤의 커밋 + staged + 로컬 변경 + 새 파일
/fundamentals-review

# git add 한 것만
/fundamentals-review staged

# git add 안 한 로컬 변경과 새 파일만
/fundamentals-review unstaged

# 경로의 파일 전체 (처음 보는 코드, 과제 코드)
/fundamentals-review src/features

# 결과를 fundamentals-review.md로 저장 (다른 인자와 함께 사용)
/fundamentals-review staged --save
```

Claude가 자동으로:
1. 인자에 맞는 범위의 파일과 변경 줄 수집
2. 관점 선택 (4원칙 + 근본 원인은 항상, JSX가 있으면 접근성, React면 상태관리)
3. 관점별 에이전트 병렬 실행
4. 같은 문제를 하나로 묶고, 원칙끼리 부딪히는 제안은 `fe-tradeoffs` 기준으로 판단
5. Critical 항목은 해당 코드를 다시 열어 검증
6. 이슈마다 원칙·루브릭 태그(① 코드 모습 ② 기술 부채 ③ 근본 원인 ④ 사용자 경험), 확신도, 근거 한 문장을 붙여 출력

### /review-comments 사용법

```bash
# Claude Code에서 /review-comments 실행
/review-comments
```

Claude가 자동으로:
1. 현재 브랜치의 PR에서 리뷰 코멘트 수집
2. 해당 파일의 현재 코드와 비교하여 이미 해결되었는지 확인
3. 각 코멘트를 분류 (🔴 개선 필요 / 🟡 논의 필요 / 🟢 조치 불필요)
4. 개선 필요 항목에 왜, 어떻게 바꿔야 하는지 구체적 방법 제시

### /design-to-code 사용법

```bash
# 1. 먼저 설계/요구사항 설명
"사용자 프로필 페이지를 만들어야 해.
- 프로필 이미지, 이름, 이메일 표시
- 프로필 수정 모달
- 비밀번호 변경 기능"

# 2. Claude Code에서 /design-to-code 실행
/design-to-code
```

Claude가 자동으로:
1. 대화 컨텍스트에서 설계/요구사항 파악
2. Explore 에이전트로 코드베이스 분석
3. Plan 에이전트로 구현 계획 수립
4. fundamentals-readability/predictability/cohesion/coupling, refactor-analyzer로 설계 검증
5. React 프로젝트면 react-principles-reviewer도 실행
6. 종합 구현 계획 리포트 생성

## 저장소 구조

```
binary-agents/
├── agents/              # 서브에이전트 MD 파일들
│   ├── refactor-analyzer.md
│   ├── fundamentals-readability.md
│   ├── fundamentals-predictability.md
│   ├── fundamentals-cohesion.md
│   ├── fundamentals-coupling.md
│   ├── react-state-reviewer.md
│   ├── react-principles-reviewer.md
│   ├── root-cause-reviewer.md
│   ├── a11y-reviewer.md
│   └── subagent-builder.md
├── commands/            # 슬래시 명령어 MD 파일들
│   ├── commit.md
│   ├── branch.md
│   ├── pr.md
│   ├── fundamentals-review.md
│   ├── design-to-code.md
│   └── review-comments.md
├── skills/              # 스킬 폴더들 (SKILL.md + 부속 파일)
│   ├── fe-readability/
│   ├── fe-predictability/
│   ├── fe-cohesion/
│   ├── fe-coupling/
│   ├── fe-tradeoffs/
│   ├── fe-root-cause/
│   └── fe-a11y/
├── bin/                 # CLI 실행 파일
├── src/                 # CLI 소스 코드
├── docs/                # 문서
│   ├── BUILDER_GUIDE.md # 커스텀 서브에이전트 제작 가이드
│   ├── INTRODUCTION.md  # 프로젝트 소개 문서
│   └── CLAUDE-RULES-TEMPLATE.md # 프로젝트 CLAUDE.md에 붙여 쓸 프론트엔드 규칙 템플릿
└── README.md
```

## 작동 원리

1. 로컬 `agents/`, `commands/`, `skills/` 디렉토리에서 목록 읽기
2. YAML frontmatter 검증 (스킬은 `SKILL.md`)
3. 사용자 프로젝트의 `.claude/agents/`, `.claude/commands/`, `.claude/skills/` 디렉토리로 복사 (스킬은 폴더째 복사)

## 요구사항

- Node.js >= 18.0.0

## 라이센스

MIT

## 기여

이슈 및 PR을 환영합니다!

## 직접 사용하기

NPM 패키지를 설치하지 않고 이 저장소의 파일을 직접 사용할 수도 있습니다:

```bash
# 저장소 클론
git clone https://github.com/01-binary/binary-agents.git

# 서브에이전트 복사
cp binary-agents/agents/*.md your-project/.claude/agents/

# 슬래시 명령어 복사
cp binary-agents/commands/*.md your-project/.claude/commands/

# 스킬 복사 (폴더째)
cp -R binary-agents/skills/* your-project/.claude/skills/
```

## 관련 링크

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Toss Frontend Fundamentals](https://frontend-fundamentals.com/code-quality/code/)
- [커스텀 서브에이전트 제작](docs/BUILDER_GUIDE.md)
