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

## 3. 승격 레벨 정하기 (위에서부터 시도)
| 레벨 | 조건 | 산출물 |
|---|---|---|
| 1. ESLint/TS 룰 | 기계가 잡을 수 있는 패턴 (import 순서, any, 특정 API 금지, 네이밍) | `.eslintrc` 변경 diff |
| 2. 테스트 | 동작으로 검증 가능 (엣지 케이스, 회귀) | 테스트 파일 추가 diff |
| 3. 모범 예시 | "이렇게 짜라"가 파일 하나로 보여줄 수 있음 | CLAUDE.md의 모범 예시 경로 추가 또는 예시 파일 정리 |
| 4. CLAUDE.md 한 줄 | 위 셋 다 안 될 때만 | 한 줄 추가 diff. **200줄 넘으면 추가 대신 교체**(지울 줄도 같이 제안) |
| 5. 스킬 수정 | 플러그인의 fe-* 스킬 자체가 틀렸거나 빠진 게 있을 때 | binary-agents 레포의 SKILL.md diff |

레벨 4·5는 "왜 1~3으로 안 되는지" 한 줄 이유를 반드시 붙인다.

## 4. 제안서 출력
항목마다 아래 형식. 전부 모아서 `.claude/promote-<날짜>.md`로 저장하고, 채팅에는 요약만.

```
### [N] <한 줄 제목>  —  반복 M회
근거: <커밋/PR/메모리 출처 2~3개>
레벨: <1~5>  (4·5면 이유)
diff:
<적용할 변경, 그대로 붙여넣을 수 있게>
```

마지막에 AskUserQuestion으로 **항목별 승인/보류/삭제**를 묻는다. 승인된 것만 적용한다. 플러그인 레포(레벨 5) 변경은 적용 후 커밋 메시지까지 제안하되 push는 사용자가 한다.

## 5. 정리 제안도 같이
- CLAUDE.md에서 **코드 보면 알 수 있는 줄**, 존재하지 않는 경로, 서로 충돌하는 줄 → 삭제 제안
- MEMORY.md에서 이미 규칙으로 승격된 항목 → 삭제 제안 (중복 로드 방지)
- `/doctor prompt-audit`, `/skill-doctor` 돌려보라고 안내 (이 스킬이 대신 못 돌림)

## 6. 마지막에
승인 처리가 끝나면 아래 명령으로 "마지막 promote 날짜"를 기록한다 (세션 시작 훅이 이걸 보고 다음 제안 시점을 정한다):
```bash
mkdir -p ~/.claude/binary-agents && date +%F > ~/.claude/binary-agents/last-promote$(git rev-parse --show-toplevel | tr '/' '_')
```

## 하지 않는 것
- 승인 없이 파일 수정
- 1회짜리 교정 승격
- 교훈을 모아두는 learnings.md 생성 — auto memory가 그 역할
