---
name: promote
description: 2~4주에 한 번 수동으로 실행. 지난 기간 동안 반복된 교정·리뷰 지적을 모아 ESLint 룰 → 테스트 → 모범 예시 → CLAUDE.md 한 줄 순으로 "승격 제안"을 만든다. 제안만 하고 적용은 사용자가 diff를 보고 승인
argument-hint: "[기간, 기본 30일]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash(mkdir:*), Bash(date:*), Bash(git rev-parse:*), Bash(git log:*), Bash(git diff:*), Bash(gh pr:*), Bash(gh api:*), AskUserQuestion
disable-model-invocation: true
---

# /promote — 반복 교정을 규칙으로 승격 (사람 승인제)

에이전트가 자기 규칙을 혼자 고치면 규칙 파일이 비대해지고 서로 충돌한다는 게 2026년 연구와 실무 보고의 공통 결론이다. 그래서 이 스킬은 **제안서만** 만든다. 적용은 사용자가 항목별로 승인한다.

## 1. 재료 모으기 (지난 N일, 기본 30)

| 출처 | 명령 | 찾는 것 |
|---|---|---|
| auto memory | `~/.claude/projects/<이 프로젝트>/memory/MEMORY.md` 읽기 | "사용자가 ~하라고 함", "~하지 말 것" 류 기록 |
| 커밋 | `git log --since=<N days> --oneline` | `fix`, `revert`, `리뷰 반영`, `수정` 류 커밋 |
| PR 리뷰 | `gh pr list --state merged --search "merged:>=<date>"` → `gh api repos/{owner}/{repo}/pulls/<n>/comments` | 사람이 단 코멘트, `review-comments`가 🔴로 분류한 것 |
| fe-verify | PR 본문의 "리뷰어 🟡" 항목 | 같은 🟡이 반복되는지 |

## 2. 묶기
같은 종류의 교정을 하나로 묶는다. **2회 이상 반복된 것만** 후보. 1회짜리는 "다음에 다시 보자" 목록에 넣고 끝.

## 3. 보낼 곳과 승격 레벨 정하기

### 3-1. 보낼 곳 (위에서부터 질문)
| 질문 | "아니오"면 보낼 곳 | 예 |
|---|---|---|
| 다른 레포에서 같은 코드를 봐도 지적할까? | 이 레포 (레벨 1~4) | 특정 디자인 시스템만 쓰기, 이 레포의 유틸 금지 |
| 이 플러그인을 쓰는 다른 사람에게도 맞는 지적일까? | 전역 `~/.claude/CLAUDE.md` 한 줄 | 응답 언어, 커밋 승인 방식, 사용자가 정한 우선순위 |
| Toss Frontend Fundamentals 원칙의 적용으로 설명되나? | 전역 `~/.claude/CLAUDE.md` 한 줄 (플러그인 범위 밖) | 특정 라이브러리 API 선호 |
| 셋 다 "예" | 플러그인 (레벨 5a~5c) | |

### 3-2. 승격 레벨 (보낼 곳 안에서 위에서부터 시도)
| 레벨 | 보낼 곳 | 조건 | 산출물 |
|---|---|---|---|
| 1. ESLint/TS 룰 | 레포 | 기계가 잡을 수 있는 패턴 (import 순서, any, 특정 API 금지, 네이밍) | `.eslintrc` 변경 diff |
| 2. 테스트 | 레포 | 동작으로 검증 가능 (엣지 케이스, 회귀) | 테스트 파일 추가 diff |
| 3. 모범 예시 | 레포 | "이렇게 짜라"가 파일 하나로 보여줄 수 있음 | CLAUDE.md의 모범 예시 경로 추가 또는 예시 파일 정리 |
| 4. CLAUDE.md 한 줄 | 레포 | 위 셋 다 안 될 때만 | 한 줄 추가 diff. **200줄 넘으면 추가 대신 교체**(지울 줄도 같이 제안) |
| 5a. 예시 추가·수정 | 플러그인 | 스킬 규칙은 맞는데 경계 케이스에서 잘못 적용함 | 해당 스킬 `references/` 에 실제 코드로 ❌/✅ 한 쌍. 본문 문장은 그대로 |
| 5b. 본문 수정 | 플러그인 | 스킬 규칙이 틀렸거나 빠짐, 또는 스킬이 불릴 때마다 항상 지켜야 함 | `SKILL.md` 본문 한 줄 + 그 규칙의 ❌/✅ 예시. 예시 없는 규칙만 넣지 않는다 |
| 5c. description 수정 | 플러그인 | 불려야 할 요청에서 스킬이 안 불림 | `SKILL.md` frontmatter `description` diff. 승인 전 `claude plugin eval .` 전후 비교 |

- `references/` 는 스킬이 불려도 모델이 필요할 때만 읽는다. 그래서 항상 지켜야 하는 것은 5a 가 아니라 5b 로 간다
- 레벨 4는 "왜 1~3으로 안 되는지", 5b는 "왜 5a로 안 되는지" 한 줄 이유를 반드시 붙인다

## 4. 제안서 출력
항목마다 아래 형식. 전부 모아서 `.claude/promote-<날짜>.md`로 저장한다. 사유는 사용자가 이 줄만 보고 다시 판단할 수 있게 **한 줄, 쉬운 말로**: 3-1의 어느 질문에서 갈렸는지, 위 레벨이 왜 안 되는지를 쓴다.

```
### [N] <한 줄 제목>  —  반복 M회
근거: <커밋/PR/메모리 출처 2~3개>
보낼 곳: <레포 | 전역 CLAUDE.md | 플러그인> — <사유 한 줄>
레벨: <1~4 | 5a | 5b | 5c> — <사유 한 줄>
diff:
<적용할 변경, 그대로 붙여넣을 수 있게>
```

채팅에는 아래 표만 보여 준다. 사용자는 이 표로 판단하고, 자세한 건 파일에서 본다.

```
| # | 지적 | 반복 | 보낼 곳 | 레벨 | 사유 |
|---|---|---|---|---|---|
| 1 | 서버 데이터를 useState로 들고 있음 | 3회 | 플러그인 | 5a | fe-state 규칙은 맞음, 폼 초기값과 섞인 경우만 틀림 |
```

마지막에 AskUserQuestion으로 **항목별 승인/보류/삭제**를 묻는다. 승인된 것만 적용한다. 플러그인 레포(레벨 5) 변경은 적용 후 커밋 메시지까지 제안하되 push는 사용자가 한다.

## 5. 정리 제안도 같이
- CLAUDE.md에서 **코드 보면 알 수 있는 줄**, 존재하지 않는 경로, 서로 충돌하는 줄 → 삭제 제안
- MEMORY.md에서 이미 규칙으로 승격된 항목 → 삭제 제안 (중복 로드 방지)
- `/doctor prompt-audit`, `/skill-doctor` 돌려보라고 안내 (이 스킬이 대신 못 돌림)

## 6. 마지막에
승인 처리가 끝나면 아래 명령으로 "마지막 promote 날짜"를 기록한다 (세션 시작 훅이 이걸 보고 다음 제안 시점을 정한다). worktree 에서 돌려도 메인 레포 날짜 하나에 기록된다:
```bash
mkdir -p ~/.claude/binary-agents && date +%F > ~/.claude/binary-agents/last-promote$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)" | tr '/' '_')
```

## 하지 않는 것
- 승인 없이 파일 수정
- 1회짜리 교정 승격
- 교훈을 모아두는 learnings.md 생성 — auto memory가 그 역할
