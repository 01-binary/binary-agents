---
name: fe-verify
description: 프론트엔드 구현을 마무리할 때 사용. typecheck·test → 브라우저 스크린샷·콘솔 증거 → simplify → a11y·상태관리 리뷰 → PR 까지 한 번에 돌리는 검증 루프. "구현 끝났어", "검증해줘", "PR 올려" 류 요청이거나 SPEC.md 기반 구현이 끝났을 때
argument-hint: "[SPEC.md 경로 또는 변경 설명]"
allowed-tools: Read, Glob, Grep, Edit, Write, Skill, Agent, Bash(git:*), Bash(gh:*), Bash(pnpm:*), Bash(npm:*), Bash(yarn:*), Bash(bun:*), Bash(npx:*), Bash(node:*)
---

# /fe-verify — 구현 마무리 검증 루프

"됐다"고 말하는 대신 **증거**를 남기고 끝낸다. 각 단계는 실패하면 다음으로 넘어가지 않고 고친 뒤 다시 돈다. 전체 루프는 최대 3회. 3회 안에 안 끝나면 멈추고 뭐가 막히는지 보고한다.

## 0. 작성 기준 (이미 짠 코드도 이 기준으로 본다)
`fe-readability`, `fe-predictability`, `fe-state`, `fe-react`, `fe-a11y` 스킬이 이 플러그인에 있다. 코드를 손보기 전에 변경 범위에 해당하는 스킬을 로드해 그 기준으로 본다. 리뷰 단계에서 지적받을 걸 여기서 먼저 고친다.

## 1. 정적 검사
```
<pm> typecheck   (없으면 tsc --noEmit)
<pm> lint        (있으면)
<pm> test        (CI=1)
```
실패 출력 전체를 읽고 고친다. 테스트가 "통과하도록" 테스트를 약화시키지 않는다. 새 동작에 테스트가 없으면 여기서 추가한다 — SPEC.md의 "완료 조건"에 적힌 개수와 내용 기준.

## 2. 브라우저 증거 (UI 변경이 있을 때)
순서대로 가능한 방법을 쓴다:
1. 프로젝트에 Playwright(`@playwright/test` 또는 `playwright`)가 있으면: dev 서버를 띄우고 1280×800, 375×812 두 뷰포트로 변경된 화면을 찍는다. `page.on('console')`로 error 레벨 메시지를 모은다. **이번 변경이 추가한 DOM 요소를 `expect(locator).toBeVisible()`로 단언**한다 — 캐시된 옛 페이지를 찍는 사고 방지.
2. Playwright가 없고 브라우저 도구(Claude in Chrome / 내장 브라우저)가 있으면: dev 서버 띄우고 같은 두 뷰포트로 확인하고 스크린샷을 남긴다.
3. 둘 다 없으면: 이 단계를 건너뛰었다고 **명시적으로** 보고한다. 건너뛴 걸 숨기지 않는다.

스크린샷은 `.claude/verify/<branch>/` 아래에 저장한다 (gitignore 대상).

통과 기준: 콘솔 error 0, 두 뷰포트에서 가로 스크롤 없음, SPEC.md 완료 조건의 "보여야 할 것"이 보임.

## 3. 단순화
`/simplify`를 돌린다. 결과 중 **동작을 바꾸지 않는** 제안만 적용한다. 적용 후 1단계를 다시 돈다.

## 4. 리뷰 (깨끗한 컨텍스트)
변경 파일 목록을 넘겨 두 에이전트를 병렬로 돌린다:
- `binary-agents:a11y-reviewer` — UI 변경이 있을 때
- `binary-agents:react-state-reviewer` — 상태·훅·Context 변경이 있을 때

🔴 항목은 고치고 1단계부터 다시. 🟡은 PR 본문 "리뷰 포인트"에 적는다. 스타일 지적은 여기서 다루지 않는다 (`/binary-agents:fundamentals-review`는 사람이 필요할 때 따로 호출).

## 5. PR
`/binary-agents:pr` 로 PR을 만들되 본문에 아래를 반드시 포함:
- 실행한 명령과 결과 (typecheck / lint / test 통과 여부, 테스트 개수)
- 스크린샷 (두 뷰포트) 또는 "브라우저 검증 건너뜀: <이유>"
- 리뷰어 🟡 항목
- 건드리지 않은 것 (SPEC.md의 "건드리지 않는 것" 그대로)

## 마지막 출력
세 줄만:
1. PR 링크
2. 통과한 검사 요약 (예: `typecheck ✓ test 14/14 ✓ 스크린샷 2장 ✓ 콘솔 0 ✓`)
3. 사람이 봐야 할 것이 있으면 그것만 (없으면 "없음")
