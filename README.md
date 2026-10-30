# Binary Agents

Claude Code 서브에이전트, 슬래시 명령어, 스킬 컬렉션 + 동기화 도구

## 소개

`binary-agents`는 프론트엔드(React/TS) 작업을 위한 **Claude Code 플러그인**입니다. Toss Frontend Fundamentals 기반 리뷰 서브에이전트, 코드를 쓸 때 자동으로 적용되는 `fe-*` 스킬, 구현 마무리 검증 루프(`/binary-agents:fe-verify`), 편집 시 포맷·세션 종료 시 typecheck+test 훅을 한 묶음으로 제공합니다.

설계 원칙은 셋입니다.
- **검증은 기계가**: lint·typecheck·test·스크린샷은 훅과 스킬이 돌리고 증거를 남깁니다.
- **기준은 쓰기 단계에서**: `fe-*` 스킬을 리뷰 때만이 아니라 코드를 쓸 때 로드합니다.
- **규칙은 짧게**: CLAUDE.md는 명령·gotcha·모범 예시·보호 경로만. 반복 교정은 프로즈가 아니라 ESLint·테스트로 승격합니다.

## 설치

```bash
# 메인 개발 머신: clone 받은 폴더를 마켓플레이스로 등록 (제자리 로드, 수정 즉시 반영)
git clone git@github.com:01-binary/binary-agents.git ~/code/chore/binary-agents
claude plugin marketplace add ~/code/chore/binary-agents
claude plugin install binary-agents@binary-agents

# 다른 머신: GitHub 레포를 마켓플레이스로 등록
claude plugin marketplace add 01-binary/binary-agents
claude plugin install binary-agents@binary-agents
# 갱신: claude plugin marketplace update binary-agents
```

설치 후 **전역 CLAUDE.md에 한 줄** 추가하면 모든 프로젝트에서 구현이 끝날 때 `fe-verify`가 자동으로 돕니다 (플러그인은 CLAUDE.md를 담을 수 없어 이 한 줄만 직접 넣어야 합니다):

```bash
cat >> ~/.claude/CLAUDE.md <<'EOF'
- 코드 변경 작업이 끝나면 항상 `/binary-agents:fe-verify`를 실행하고, 그 마지막 세 줄로 보고한다. "됐습니다"로 끝내지 않는다.
EOF
```

`plugin.json`에 `version`을 두지 않으므로 커밋마다 새 버전으로 인식됩니다. 한 세션만 써 보려면 `claude --plugin-dir ~/code/chore/binary-agents`.

프로젝트 쪽에는 `docs/CLAUDE-RULES-TEMPLATE.md`를 참고해 **30줄 안쪽의 CLAUDE.md**만 두면 됩니다. GitHub 쪽(tier 라벨, branch protection)은 `templates/github/README.md`.

### 예전 npx 설치
`npx binary-agents@latest` CLI는 호환용으로 남아 있지만 더 이상 권장하지 않습니다. 훅·`/binary-agents:*` 스킬 프리픽스는 플러그인 설치에서만 동작합니다.

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
| `fe-react` | 컴포넌트 데이터 소유, 부수효과 위치, 데이터 Fetching·Suspense·AsyncBoundary, 네이밍, 메모이제이션 기준 | `react-principles-reviewer`, `/fundamentals-review`·`/spec`·`/fe-verify`에서 사용 |
| `fe-state` | 상태 성질(수명·범위·빈도)로 도구 고르기, 5단계 에스컬레이터, Context·서버 상태·전역 스토어 기준 | `react-state-reviewer` |

## 슬래시 명령어 (스킬)

플러그인으로 설치하면 `/binary-agents:<이름>`으로 호출합니다. 전부 `disable-model-invocation: true`라 Claude가 임의로 실행하지 않고, 컨텍스트 비용도 호출 전까지 0입니다.

| 명령어 | 설명 | 언제 |
|--------|------|------|
| `/binary-agents:spec` | 요구사항 인터뷰 → 레포 직접 읽기 → 1페이지 `SPEC.md`. 구현은 새 세션에서 | tier 3 (공용·수익 로직·큰 기능) 시작 전 |
| `/binary-agents:fe-verify` | typecheck·test → 두 뷰포트 스크린샷·콘솔 → `/simplify` → a11y·상태 리뷰 → PR. 증거를 PR 본문에 남김 | 구현이 끝났을 때 |
| `/binary-agents:fundamentals-review` | 4원칙 + 근본 원인 + 접근성 + 상태 + React 리뷰를 병렬 실행, 이슈 단위로 합쳐 원칙 충돌까지 판단 | tier 2·3 PR을 사람이 보기 전 |
| `/binary-agents:review-comments` | PR 리뷰 코멘트를 스킬 기준으로 분석해 개선 필요 여부·변경 방법·답글 초안 | 리뷰 받은 뒤 |
| `/binary-agents:commit` | 컨벤션에 맞는 커밋 메시지, 섞인 변경은 나눠서 커밋 | |
| `/binary-agents:branch` | 기본 브랜치 최신화 후 컨벤션에 맞는 브랜치 생성 | |
| `/binary-agents:pr` | 브랜치 변경 분석 후 PR 생성 | `fe-verify`가 마지막에 호출 |

## 훅

플러그인이 켜진 모든 세션에서 동작합니다 (`hooks/hooks.json`). JS/TS 프로젝트(`package.json`)가 아니면 아무것도 하지 않습니다.

| 이벤트 | 동작 |
|--------|------|
| `PostToolUse` (Edit/Write) | 방금 편집한 파일 하나만 `prettier` → `eslint --fix`. 실패해도 막지 않음 |
| `Stop` | `typecheck`(없으면 `tsc --noEmit`) + `test` 실패 시 exit 2로 Claude를 되돌림. 마지막 40줄만 전달. `stop_hook_active`·백그라운드 작업 중이면 통과 |

## 개발 흐름 (tier)

| tier | 기준 (`templates/github/pr-tier.yml`이 라벨링) | 흐름 |
|------|------|------|
| 1 | ≤150줄, ≤5파일, 보호 경로 없음 | 구현 → `fe-verify` → PR → (shadow 기간 후) auto-merge, 사람은 증거만 봄 |
| 2 | 그 외 | 구현 → `fe-verify` → `fundamentals-review` → 사람이 PR 훑고 승인 |
| 3 | 광고 SDK·수익·공용 컴포넌트·CI·설정 | `spec` → 새 세션 구현 → `fe-verify` → `fundamentals-review` → 실제 리뷰 |

### /binary-agents:commit 사용법

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

### /binary-agents:branch 사용법

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

### /binary-agents:pr 사용법

```bash
# Claude Code에서 /pr 실행
/pr
```

Claude가 자동으로:
1. 현재 브랜치와 main 브랜치 차이 분석
2. 커밋 내역 및 변경 파일 확인
3. PR 제목 및 설명 생성
4. GitHub CLI로 PR 생성

### /binary-agents:fundamentals-review 사용법

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

### /binary-agents:review-comments 사용법

```bash
/review-comments          # 현재 브랜치의 PR
/review-comments 123      # PR 번호 지정 (URL도 가능)
```

Claude가 자동으로:
1. PR의 리뷰 스레드 수집 (resolve된 스레드는 제외하고 개수만 표시)
2. 해당 파일의 현재 코드와 비교하여 이미 해결되었는지 확인
3. 코드 품질 코멘트는 `fe-*` 스킬을 근거로 판단해 분류 (🔴 개선 필요 / 🟡 논의 필요 / 🟢 조치 불필요)
4. 🔴·🟡 항목에 왜, 어떻게 바꿔야 하는지 제시하고, 🟡에는 근거를 담은 답글 초안 작성 (게시하지 않음)

### /binary-agents:spec 사용법

```bash
/binary-agents:spec 사용자 프로필 페이지 — 이미지·이름·이메일 표시, 수정 모달, 비밀번호 변경
```

Claude가:
1. 비어 있는 요구사항(보이는 결과·건드리면 안 되는 것·완료 조건·범위 밖)을 최대 3개 질문
2. 에이전트 없이 레포를 직접 읽어 영향 파일·재사용할 코드·모범 예시를 확인
3. 1페이지 `SPEC.md` 작성 (목표 / 건드리는 파일 / 건드리지 않는 것 / 재사용 / 인터페이스 / 완료 조건 / 열린 질문)
4. "새 세션을 열고 `SPEC.md` 읽고 구현해. 끝나면 `/binary-agents:fe-verify`" 안내

구현 계획을 리뷰 에이전트 7개로 검증하던 예전 `/design-to-code`는 이걸로 대체됐습니다. 코드 리뷰는 코드가 생긴 뒤 `/binary-agents:fundamentals-review`에서 합니다.

### /binary-agents:fe-verify 사용법

```bash
/binary-agents:fe-verify            # SPEC.md가 있으면 그 완료 조건 기준
/binary-agents:fe-verify 장바구니 수량 버튼 추가
```

최대 3회 루프: 정적 검사 → 브라우저 증거(Playwright 또는 브라우저 도구, 둘 다 없으면 "건너뜀" 명시) → `/simplify` → `a11y-reviewer`·`react-state-reviewer` → PR(증거 포함). 마지막 출력은 PR 링크, 통과 요약, 사람이 봐야 할 것 세 줄입니다.

## 저장소 구조

```
binary-agents/
├── .claude-plugin/
│   ├── plugin.json          # 플러그인 매니페스트 (version 없음 → 커밋이 버전)
│   └── marketplace.json     # 이 레포 자체를 마켓플레이스로 등록
├── agents/                  # 리뷰 서브에이전트 9개 (read-only)
├── skills/
│   ├── fe-*/                # 판단 기준 스킬 9개 (쓰기·리뷰 양쪽에서 로드)
│   ├── spec/                # tier 3 진입점
│   ├── fe-verify/           # 구현 마무리 검증 루프
│   ├── fundamentals-review/ # 수동 리뷰
│   └── commit/ branch/ pr/ review-comments/
├── hooks/hooks.json         # PostToolUse 포맷, Stop typecheck+test
├── scripts/                 # 훅 스크립트
├── templates/github/        # PR tier 라벨 워크플로 + branch protection 가이드
├── docs/
│   ├── CLAUDE-RULES-TEMPLATE.md # 프로젝트 CLAUDE.md 템플릿 (30줄 안쪽)
│   ├── BUILDER_GUIDE.md
│   └── INTRODUCTION.md
├── bin/ src/                # 예전 npx 동기화 CLI (호환용)
└── README.md
```

## 작동 원리 (예전 npx CLI)

1. 로컬 `agents/`, `skills/` 디렉토리에서 목록 읽기 (`commands/`는 `skills/`로 통합됨)
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

# 스킬 복사 (폴더째)
cp -R binary-agents/skills/* your-project/.claude/skills/
```

## 관련 링크

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Toss Frontend Fundamentals](https://frontend-fundamentals.com/code-quality/code/)
- [커스텀 서브에이전트 제작](docs/BUILDER_GUIDE.md)
