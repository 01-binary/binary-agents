# Binary Agents

Claude Code 서브에이전트 및 슬래시 명령어 컬렉션 + 동기화 도구

## 소개

`binary-agents`는 Claude Code의 강력한 서브에이전트와 슬래시 명령어를 모아놓은 모노레포입니다. 코드 리뷰, 리팩토링 분석, 주니어 개발자 친화성 체크 등 다양한 서브에이전트와 자동 커밋/PR 생성 등의 슬래시 명령어를 제공하며, 이를 프로젝트에 쉽게 설치할 수 있는 CLI 도구를 포함합니다.

## 사용법

```bash
# 현재 프로젝트에 설치 (.claude/)
npx binary-agents sync

# 전역 설치 (~/.claude/)
npx binary-agents sync -g

# 에이전트만 / 명령어만
npx binary-agents sync --agents
npx binary-agents sync --commands

# 기존 파일 삭제 후 새로 설치
npx binary-agents sync --clean

# 목록 보기
npx binary-agents list
```

## 서브에이전트 종류

| 이름 | 설명 |
|------|------|
| `code-reviewer` | 아키텍처, 타입 안전성, 에러 처리, 테스트, 접근성, 보안 리뷰 |
| `refactor-analyzer` | 코드 중복, 복잡성, 추상화 기회, 코드 스멜 분석 |
| `junior-checker` | 주니어 개발자 관점 가독성, 네이밍, 복잡도 체크 |
| `fundamentals-code` | Toss Frontend Fundamentals 기반 (가독성, 예측 가능성, 응집도, 결합도) |
| `react-performance-optimizer` | React 리렌더, 메모이제이션, 훅 최적화 분석 |
| `figma-implementation-checker` | Figma 디자인과 구현 코드 비교, 디자인 토큰 검증 |
| `subagent-builder` | 커스텀 서브에이전트 빌더 |

## 슬래시 명령어

| 명령어 | 설명 |
|--------|------|
| `/commit` | git log 분석 후 컨벤션에 맞는 커밋 메시지 자동 생성 및 커밋 |
| `/branch` | main에서 pull 후 브랜치 네이밍 컨벤션에 맞는 새 브랜치 생성 |
| `/pr` | 브랜치 변경사항 분석 후 PR 자동 생성 |
| `/review-pr` | PR 링크를 받아 변경사항 분석 후 GitHub 스타일 라인별 코드 리뷰 |
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
3. 5개 에이전트를 병렬 실행하여 분석
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

## 저장소 구조

```
binary-agents/
├── agents/              # 서브에이전트 MD 파일들
│   ├── code-reviewer.md
│   ├── refactor-analyzer.md
│   ├── junior-checker.md
│   ├── fundamentals-code.md
│   ├── react-performance-optimizer.md
│   ├── figma-implementation-checker.md
│   └── subagent-builder.md
├── commands/            # 슬래시 명령어 MD 파일들
│   ├── commit.md
│   ├── branch.md
│   ├── pr.md
│   ├── review-pr.md
│   └── code-review.md
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
