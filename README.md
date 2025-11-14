# Binary Agents

Claude Code 서브에이전트 컬렉션 및 동기화 도구

## 소개

`binary-agents`는 Claude Code의 강력한 서브에이전트들을 모아놓은 모노레포입니다. 코드 리뷰, 리팩토링 분석, 주니어 개발자 친화성 체크 등 다양한 서브에이전트와 이를 프로젝트에 쉽게 설치할 수 있는 CLI 도구를 제공합니다.

## 설치

### NPX 사용 (권장)

별도 설치 없이 바로 사용:

```bash
npx @01-binary/binary-agents sync
```

### 글로벌 설치

```bash
npm install -g @01-binary/binary-agents
binary-agents sync
```

### 로컬 설치

```bash
npm install @01-binary/binary-agents
npx binary-agents sync
```

## 사용법

### 모든 서브에이전트 동기화

```bash
npx @01-binary/binary-agents sync
```

이 명령어는 `.claude/agents/` 디렉토리에 모든 서브에이전트 파일을 다운로드합니다.

### 기본 버전만 동기화

```bash
npx @01-binary/binary-agents sync --basic
```

Haiku 모델을 사용하는 기본 서브에이전트만 동기화합니다.

### 고급 버전만 동기화

```bash
npx @01-binary/binary-agents sync --advanced
```

Sonnet 모델을 사용하는 고급 서브에이전트만 동기화합니다.

### 사용 가능한 서브에이전트 목록 보기

```bash
npx @01-binary/binary-agents list
```

## 서브에이전트 종류

### 기본 버전 (Haiku 모델)
- `code-reviewer.md` - 코드 리뷰어
- `refactor-analyzer.md` - 리팩토링 분석기
- `junior-friendly-checker.md` - 주니어 친화성 체커

### 고급 버전 (Sonnet 모델)
- `advanced-code-reviewer.md` - 고급 코드 리뷰어
- `advanced-refactor-analyzer.md` - 고급 리팩토링 분석기
- `advanced-junior-checker.md` - 고급 주니어 친화성 체커

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
│   └── subagent-builder.md
├── bin/                 # CLI 실행 파일
├── src/                 # CLI 소스 코드
├── docs/                # 문서
│   ├── SUBAGENTS.md     # 서브에이전트 상세 설명
│   ├── COMPARISON.md    # Basic vs Advanced 비교
│   └── BUILDER_GUIDE.md # 커스텀 서브에이전트 제작 가이드
└── README.md
```

## 작동 원리

1. 로컬 `agents/` 디렉토리에서 서브에이전트 파일 목록 읽기
2. YAML frontmatter 검증
3. 사용자 프로젝트의 `.claude/agents/` 디렉토리로 복사

## 요구사항

- Node.js >= 18.0.0

## 라이센스

MIT

## 기여

이슈 및 PR을 환영합니다!

## 서브에이전트 직접 사용하기

NPM 패키지를 설치하지 않고 이 저장소의 서브에이전트를 직접 사용할 수도 있습니다:

1. 저장소 클론:
   ```bash
   git clone https://github.com/01-binary/binary-agents.git
   ```

2. 원하는 서브에이전트 파일을 프로젝트의 `.claude/agents/` 디렉토리로 복사:
   ```bash
   cp binary-agents/agents/*.md your-project/.claude/agents/
   ```

## 관련 링크

- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)
- [서브에이전트 상세 가이드](docs/SUBAGENTS.md)
- [Basic vs Advanced 비교](docs/COMPARISON.md)
- [커스텀 서브에이전트 제작](docs/BUILDER_GUIDE.md)
