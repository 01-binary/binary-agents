# Binary Agents

Claude Code 서브에이전트 및 슬래시 명령어 컬렉션 + 동기화 도구

## 소개

`binary-agents`는 Claude Code의 강력한 서브에이전트와 슬래시 명령어를 모아놓은 모노레포입니다. 코드 리뷰, 리팩토링 분석, 주니어 개발자 친화성 체크 등 다양한 서브에이전트와 자동 커밋 등의 슬래시 명령어를 제공하며, 이를 프로젝트에 쉽게 설치할 수 있는 CLI 도구를 포함합니다.

## 설치

### NPX 사용 (권장)

별도 설치 없이 바로 사용:

```bash
npx binary-agents sync
```

### 글로벌 설치

```bash
npm install -g binary-agents
binary-agents sync
```

### 로컬 설치

```bash
npm install binary-agents
npx binary-agents sync
```

## 사용법

### 기본 동기화

현재 프로젝트의 `.claude/` 디렉토리에 agents와 commands 모두 설치:

```bash
npx binary-agents sync
```

### 선택적 동기화

```bash
# 서브에이전트만 동기화
npx binary-agents sync --agents

# 슬래시 명령어만 동기화
npx binary-agents sync --commands
```

### 전역 설치

홈 디렉토리의 `~/.claude/`에 설치 (모든 프로젝트에서 사용 가능):

```bash
# 전역으로 모두 설치
npx binary-agents sync --global
# 또는
npx binary-agents sync -g

# 전역 + 서브에이전트만
npx binary-agents sync -g --agents

# 전역 + 슬래시 명령어만
npx binary-agents sync -g --commands
```

### 목록 보기

```bash
npx binary-agents list
```

## 서브에이전트 종류

| 이름 | 설명 |
|------|------|
| `code-reviewer` | 코드 리뷰어 (웹 검색 포함) |
| `refactor-analyzer` | 리팩토링 분석기 (웹 검색 포함) |
| `junior-checker` | 주니어 친화성 체커 (웹 검색 포함) |
| `fundamentals-code` | Toss Frontend Fundamentals 기반 코드 품질 분석기 + 점수화 |
| `react-performance-optimizer` | React 성능 최적화 |
| `subagent-builder` | 커스텀 서브에이전트 빌더 |

## 슬래시 명령어

| 명령어 | 설명 |
|--------|------|
| `/commit` | git log 분석 후 컨벤션에 맞는 커밋 메시지 자동 생성 및 커밋 |
| `/branch` | main에서 pull 후 브랜치 네이밍 컨벤션에 맞는 새 브랜치 생성 |
| `/pr` | 브랜치 변경사항 분석 후 PR 자동 생성 |
| `/code-review` | 여러 에이전트를 병렬 실행하여 종합 코드 리뷰 |

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

### /code-review 사용법

```bash
# Claude Code에서 /code-review 실행
/code-review
```

Claude가 자동으로:
1. 리뷰 타입 선택 (Quick/Standard/Deep/Full/Custom)
2. 선택된 에이전트들을 병렬 실행
3. 결과 집계 및 우선순위 정렬
4. 종합 리뷰 리포트 생성

## 저장소 구조

```
binary-agents/
├── agents/              # 서브에이전트 MD 파일들
│   ├── code-reviewer.md
│   ├── refactor-analyzer.md
│   ├── junior-checker.md
│   ├── fundamentals-code.md
│   ├── react-performance-optimizer.md
│   └── subagent-builder.md
├── commands/            # 슬래시 명령어 MD 파일들
│   ├── commit.md
│   ├── branch.md
│   ├── pr.md
│   └── code-review.md
├── bin/                 # CLI 실행 파일
├── src/                 # CLI 소스 코드
├── docs/                # 문서
│   ├── SUBAGENTS.md     # 서브에이전트 상세 설명
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
- [서브에이전트 상세 가이드](docs/SUBAGENTS.md)
- [커스텀 서브에이전트 제작](docs/BUILDER_GUIDE.md)
