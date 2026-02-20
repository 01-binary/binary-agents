# Binary Agents

Claude Code 서브에이전트 및 슬래시 명령어 컬렉션 + 동기화 도구

## 소개

`binary-agents`는 Claude Code의 강력한 서브에이전트와 슬래시 명령어를 모아놓은 모노레포입니다. 코드 리뷰, 리팩토링 분석, 주니어 개발자 친화성 체크 등 다양한 서브에이전트와 자동 커밋/PR 생성 등의 슬래시 명령어를 제공하며, 이를 프로젝트에 쉽게 설치할 수 있는 CLI 도구를 포함합니다.

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
❯ 모두 (에이전트 + 명령어)
  에이전트만
  명령어만

? 기존 binary-agents 파일을 삭제하고 새로 설치할까요?
❯ 예 (binary-agents 파일만 삭제, 커스텀 파일 보존)
  아니오 (기존 파일 유지)
```

## 서브에이전트 종류

| 이름 | 설명 |
|------|------|
| `code-reviewer` | 아키텍처, 타입 안전성, 에러 처리, 테스트, 접근성, 보안 리뷰 |
| `refactor-analyzer` | 코드 중복, 복잡성, 추상화 기회, 코드 스멜 분석 |
| `junior-checker` | 주니어 개발자 관점 가독성, 네이밍, 복잡도 체크 |
| `fundamentals-readability` | Toss Fundamentals - 가독성 (코드 분리, 추상화, 함수 쪼개기, 조건 네이밍, 매직 넘버) |
| `fundamentals-predictability` | Toss Fundamentals - 예측 가능성 (이름 충돌, 반환 타입 통일, 숨은 로직) |
| `fundamentals-cohesion` | Toss Fundamentals - 응집도 (디렉토리 구조, 매직 넘버 관리, 폼 응집도) |
| `fundamentals-coupling` | Toss Fundamentals - 결합도 (단일 책임, 중복 코드 허용, Props Drilling) |
| `react-state-reviewer` | React 상태관리 리뷰 (상태 성질 기반 배치, Context 오용, 5단계 에스컬레이터) |
| `react-performance-optimizer` | React 리렌더, 메모이제이션, 훅 최적화 분석 |
| `react-principles-reviewer` | React 개발 원칙 (응집도/명시성, Props 관리, 네이밍, 부수효과, AsyncBoundary) |
| `maintainable-code-reviewer` | 유지보수성 리뷰 (UI-코드 1:1 대응, 분리의 4원칙, 추상화 원칙) |
| `subagent-builder` | 커스텀 서브에이전트 빌더 |

## 슬래시 명령어

| 명령어 | 설명 |
|--------|------|
| `/commit` | git log 분석 후 컨벤션에 맞는 커밋 메시지 자동 생성 및 커밋 |
| `/branch` | main에서 pull 후 브랜치 네이밍 컨벤션에 맞는 새 브랜치 생성 |
| `/pr` | 브랜치 변경사항 분석 후 PR 자동 생성 |
| `/review-pr` | PR 링크를 받아 변경사항 분석 후 GitHub 스타일 라인별 코드 리뷰 |
| `/code-review` | 여러 에이전트를 병렬 실행하여 종합 코드 리뷰 |
| `/fundamentals-review` | Toss Fundamentals 4개 + React 상태관리 집중 리뷰 |
| `/design-to-code` | 설계/요구사항을 분석하여 구현 계획 생성 |
| `/figma-check` | Figma MCP로 디자인 정보를 가져와 구현 코드와 비교 분석 |

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

### /review-pr 사용법

```bash
# PR 번호로 실행
/review-pr 123

# PR URL로 실행
/review-pr https://github.com/owner/repo/pull/123
```

Claude가 자동으로:
1. PR 정보 및 diff 가져오기
2. 리뷰 타입 선택 (전체 리뷰/커스텀)
3. 6개 에이전트를 병렬 실행하여 분석
4. GitHub 스타일 라인별 코드 리뷰 생성

### /code-review 사용법

```bash
# Claude Code에서 /code-review 실행
/code-review
```

Claude가 자동으로:
1. 리뷰 타입 선택 (전체 리뷰/커스텀)
2. 선택된 에이전트들을 병렬 실행
3. 결과 집계 및 우선순위 정렬
4. 종합 리뷰 리포트 생성

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
│   ├── code-reviewer.md
│   ├── refactor-analyzer.md
│   ├── junior-checker.md
│   ├── fundamentals-readability.md
│   ├── fundamentals-predictability.md
│   ├── fundamentals-cohesion.md
│   ├── fundamentals-coupling.md
│   ├── react-state-reviewer.md
│   ├── react-performance-optimizer.md
│   ├── react-principles-reviewer.md
│   ├── maintainable-code-reviewer.md
│   └── subagent-builder.md
├── commands/            # 슬래시 명령어 MD 파일들
│   ├── commit.md
│   ├── branch.md
│   ├── pr.md
│   ├── review-pr.md
│   ├── code-review.md
│   ├── fundamentals-review.md
│   ├── design-to-code.md
│   └── figma-check.md
├── bin/                 # CLI 실행 파일
├── src/                 # CLI 소스 코드
├── docs/                # 문서
│   └── BUILDER_GUIDE.md # 커스텀 서브에이전트 제작 가이드
└── README.md
```

## 작동 원리

1. 로컬 `agents/`, `commands/` 디렉토리에서 파일 목록 읽기
2. YAML frontmatter 검증
3. 사용자 프로젝트의 `.claude/agents/`, `.claude/commands/` 디렉토리로 복사

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
```

## 관련 링크

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Toss Frontend Fundamentals](https://frontend-fundamentals.com/code-quality/code/)
- [커스텀 서브에이전트 제작](docs/BUILDER_GUIDE.md)
