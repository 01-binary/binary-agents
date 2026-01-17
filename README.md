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

# 기본 서브에이전트만 (Haiku 모델)
npx binary-agents sync --agents --basic

# 고급 서브에이전트만 (Opus 모델)
npx binary-agents sync --agents --advanced
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

### 기본 버전 (Haiku 모델)
| 이름 | 설명 |
|------|------|
| `code-reviewer` | 코드 리뷰어 |
| `refactor-analyzer` | 리팩토링 분석기 |
| `junior-friendly-checker` | 주니어 친화성 체커 |

### 고급 버전 (Opus 모델)
| 이름 | 설명 |
|------|------|
| `advanced-code-reviewer` | 고급 코드 리뷰어 (웹 검색 포함) |
| `advanced-refactor-analyzer` | 고급 리팩토링 분석기 (웹 검색 포함) |
| `advanced-junior-checker` | 고급 주니어 친화성 체커 (웹 검색 포함) |
| `react-performance-optimizer` | React 성능 최적화 |
| `toss-cohesion-analyzer` | Toss 팀 원칙 기반 응집도 분석기 |
| `subagent-builder` | 커스텀 서브에이전트 빌더 |

## 슬래시 명령어

| 명령어 | 설명 |
|--------|------|
| `/commit` | git log 분석 후 컨벤션에 맞는 커밋 메시지 자동 생성 및 커밋 |

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

## 저장소 구조

```
binary-agents/
├── agents/              # 서브에이전트 MD 파일들
│   ├── code-reviewer.md
│   ├── advanced-code-reviewer.md
│   ├── refactor-analyzer.md
│   ├── advanced-refactor-analyzer.md
│   ├── junior-friendly-checker.md
│   ├── advanced-junior-checker.md
│   ├── toss-cohesion-analyzer.md
│   ├── react-performance-optimizer.md
│   └── subagent-builder.md
├── commands/            # 슬래시 명령어 MD 파일들
│   └── commit.md
├── bin/                 # CLI 실행 파일
├── src/                 # CLI 소스 코드
├── docs/                # 문서
│   ├── SUBAGENTS.md     # 서브에이전트 상세 설명
│   ├── COMPARISON.md    # Basic vs Advanced 비교
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
- [서브에이전트 상세 가이드](docs/SUBAGENTS.md)
- [Basic vs Advanced 비교](docs/COMPARISON.md)
- [커스텀 서브에이전트 제작](docs/BUILDER_GUIDE.md)
