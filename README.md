# Binary Agents

Claude Code 서브에이전트, 슬래시 명령어, 스킬 컬렉션 + 동기화 도구

## 소개

`binary-agents`는 Claude Code의 서브에이전트, 슬래시 명령어, 스킬을 모아놓은 모노레포입니다. Toss Frontend Fundamentals 기반 코드 리뷰와 설계 검증 서브에이전트, 자동 커밋/PR 생성 등의 슬래시 명령어, 코드를 쓸 때 자동으로 적용되는 스킬을 제공하며, 이를 프로젝트에 쉽게 설치할 수 있는 CLI 도구를 포함합니다.

## 사용법

```bash
# 대화형 설치 (권장): @latest를 붙여야 npx 캐시와 상관없이 항상 최신 버전으로 실행됩니다
npx binary-agents@latest

# 목록 보기
npx binary-agents@latest list
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
```

설치할 때마다 설치 위치의 binary-agents 파일을 **패키지 내용과 똑같이** 맞춥니다.
- 바뀐 파일은 새로 쓰고, 패키지에서 빠진 예전 파일은 지웁니다.
- 직접 만든 에이전트·명령어·스킬은 이름이 겹치지 않는 한 그대로 둡니다.
- 예전 버전(npx 캐시)으로 실행하면 시작할 때 경고하고 `@latest`로 다시 실행하라고 안내합니다.

## 서브에이전트 종류

| 이름 | 설명 |
|------|------|
| `fundamentals-readability` | Toss Fundamentals - 가독성 (코드 분리, 추상화, 함수 쪼개기, 조건 네이밍, 매직 넘버) |
| `fundamentals-predictability` | Toss Fundamentals - 예측 가능성 (이름 충돌, 반환 타입 통일, 숨은 로직) |
| `fundamentals-cohesion` | Toss Fundamentals - 응집도 (디렉토리 구조, 매직 넘버 관리, 폼 응집도) |
| `fundamentals-coupling` | Toss Fundamentals - 결합도 (단일 책임, 중복 코드 허용, Props Drilling) |
| `react-state-reviewer` | React 상태관리 리뷰 (상태 성질 기반 배치, Context 오용, 5단계 에스컬레이터) |
| `react-principles-reviewer` | React 컴포넌트 패턴 (데이터 소유, 부수효과 위치, 데이터 Fetching·비동기 경계, 네이밍, 메모이제이션) |
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
| `fe-react` | 컴포넌트 데이터 소유, 부수효과 위치, 데이터 Fetching·Suspense·AsyncBoundary, 네이밍, 메모이제이션 기준 | `react-principles-reviewer`, `/fundamentals-review`·`/design-to-code`에서 사용 |
| `fe-state` | 상태 성질(수명·범위·빈도)로 도구 고르기, 5단계 에스컬레이터, Context·서버 상태·전역 스토어 기준 | `react-state-reviewer` |

## 슬래시 명령어

| 명령어 | 설명 |
|--------|------|
| `/commit` | git log 분석 후 컨벤션에 맞는 커밋 메시지 생성, 여러 변경이 섞였으면 나눠서 커밋 |
| `/branch` | 기본 브랜치(자동 감지 또는 `--from`)를 최신으로 받은 뒤 네이밍 컨벤션에 맞는 새 브랜치 생성 |
| `/pr` | 브랜치 변경사항 분석 후 PR 자동 생성 |
| `/fundamentals-review` | Toss Fundamentals 4원칙 + 근본 원인 + 접근성 + 상태관리 + React 패턴 리뷰를 병렬 실행하고 이슈 단위로 합쳐 원칙 충돌까지 판단 |
| `/design-to-code` | 설계/요구사항을 분석하여 구현 계획 생성 |
| `/review-comments` | PR 리뷰 코멘트(resolve된 스레드 제외)를 스킬 기준으로 분석해 개선 필요 여부, 변경 방법, 답글 초안 제시 |

### /commit 사용법

```bash
# 1. 변경 사항 스테이징
git add .

# 2. Claude Code에서 /commit 실행
/commit
```

Claude가 자동으로:
1. 최근 커밋 로그에서 컨벤션 분석
2. staged changes 확인 (lock 파일 등은 내용까지 읽지 않음)
3. 여러 논리적 변경이 섞여 있으면 나눠서 커밋하는 안 제시 (묶음별 파일과 메시지)
4. 확인 후 커밋 실행 (나누는 경우 묶음별로 다시 stage해서 커밋)

### /branch 사용법

```bash
/branch                          # 기본 브랜치 기준, 작업 내용은 물어봄
/branch 로그인 기능 추가          # 설명으로 이름 자동 결정
/branch --from develop 결제 수정  # develop 기준으로 생성
```

Claude가 자동으로:
1. 기준 브랜치 결정 (`--from` 또는 origin/HEAD 자동 감지, 없으면 main → master)
2. 최근 브랜치 이름에서 컨벤션 분석
3. 기준 브랜치를 `git pull --ff-only`로 최신화 (origin이 없으면 건너뜀)
4. 작업 목적에 맞는 브랜치 이름 생성 (feature/, fix/, chore/ 등) 후 확인받고 생성

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
1. 인자에 맞는 범위의 파일과 변경 줄 수집 (diff 모드는 지운 줄까지)
2. 관점 선택 (4원칙 + 근본 원인은 항상, JSX가 있으면 접근성과 React 패턴, React면 상태관리)
3. 관점별 에이전트 병렬 실행
4. 같은 문제를 하나로 묶고, 원칙끼리 부딪히는 제안은 각 수정안을 나란히 놓고 `fe-tradeoffs` 기준으로 판단
5. Critical 항목과 라이브러리 동작에 기대는 주장은 코드와 `node_modules`를 열어 검증
6. 이슈마다 문제 → 현재 코드 → 수정 코드 → 해결 → 확인 순서로 짧게 출력. 태그는 `코드` `부채` `버그` `UX`, 지적한 관점 수(`n/N`), 확신이 낮으면 `잠재`·`확인 필요`
7. 마지막에 리뷰로는 못 보는 것(커서, 좁은 화면, 키보드 등)을 직접 확인할 체크리스트로 정리

### /review-comments 사용법

```bash
/review-comments          # 현재 브랜치의 PR
/review-comments 123      # PR 번호 지정 (URL도 가능)
```

Claude가 자동으로:
1. PR의 리뷰 스레드 수집 (resolve된 스레드는 제외하고 개수만 표시)
2. 해당 파일의 현재 코드와 비교하여 이미 해결되었는지 확인
3. 코드 품질 코멘트는 `fe-*` 스킬을 근거로 판단해 분류 (🔴 개선 필요 / 🟡 논의 필요 / 🟢 조치 불필요)
4. 🔴·🟡 항목에 왜, 어떻게 바꿔야 하는지 제시하고, 🟡에는 근거를 담은 답글 초안 작성 (게시하지 않음)

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
4. fundamentals-readability/predictability/cohesion/coupling으로 설계 검증 (공통화·재사용 판단은 fe-tradeoffs 기준)
5. React 프로젝트면 react-state-reviewer, react-principles-reviewer도 실행
6. 계획에 UI 컴포넌트가 있으면 a11y-reviewer로 접근성 구조 검증
7. 종합 구현 계획 리포트 생성

## 저장소 구조

```
binary-agents/
├── agents/              # 서브에이전트 MD 파일들
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
│   ├── fe-a11y/
│   ├── fe-state/
│   └── fe-react/
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
3. 설치 위치의 binary-agents 파일을 지우고 다시 복사 (스킬은 폴더째 복사)
4. 패키지에서 빠진 예전 파일 정리
   - 지난 설치 기록(`.claude/.binary-agents-manifest.json`)에는 있는데 지금 패키지에는 없는 파일
   - 설치 기록이 생기기 전에 패키지에서 빠진 파일(설치기에 목록으로 들어 있음)
5. 이번 설치 내용과 버전을 설치 기록에 저장

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
