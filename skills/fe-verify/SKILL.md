---
name: fe-verify
description: 프론트엔드 구현을 마무리할 때 사용. typecheck·test → 영향 범위 → 브라우저 스크린샷·콘솔 증거 → simplify → a11y·상태관리 리뷰까지 돌리는 검증 루프 (커밋·PR은 하지 않음). "구현 끝났어", "검증해줘", "PR 올려" 류 요청이거나 SPEC.md 기반 구현이 끝났을 때
argument-hint: "[SPEC.md 경로 또는 변경 설명]"
allowed-tools: Read, Glob, Grep, Edit, Write, Skill, Agent, Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git rev-parse:*), Bash(git branch:*), Bash(pnpm:*), Bash(npm:*), Bash(yarn:*), Bash(bun:*), Bash(npx:*), Bash(node:*), Bash(agent-browser:*), Bash(command -v:*)
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

## 1.5 영향 범위 (사이드이펙트)
테스트가 없는 호출처는 1단계로 안 잡힌다. 바뀐 것을 쓰는 쪽을 직접 따라간다.
1. `git diff --name-only`로 바뀐 파일 → 그 파일이 export하는 것 중 **시그니처·props·반환값·동작이 바뀐 것** 목록
2. 각각 Grep으로 import하는 파일 전부 찾기 (barrel `index.ts` 거쳐서 쓰는 곳 포함)
3. 호출처마다: 바뀐 동작에 영향받나? → 받으면 그 호출처에 테스트가 있는지 확인, 없으면 **그 호출처 기준 테스트를 추가**하고 1단계 재실행
4. 공용 컴포넌트·훅(2곳 이상에서 씀)을 고쳤으면 2단계 스크린샷에 **원래 작업 화면 + 다른 사용처 1곳**을 추가
5. 결과를 PR 본문 "영향 범위" 섹션에 쓴다: `바뀐 export N개 → 호출처 M곳 → 확인 완료 / 테스트 추가 K개`. 호출처가 10곳 넘으면 멈추고 사용자에게 알린다 — tier 3 신호

## 2. 브라우저 증거 (UI 변경이 있을 때)
순서대로 가능한 방법을 쓴다:
0. `command -v agent-browser`가 있으면 이걸 우선 쓴다. **사용법은 이 파일에 적지 않고 매번 `agent-browser skills get core`로 불러와 따른다** (설치된 CLI 버전과 항상 맞음. 갱신은 `agent-browser upgrade`). dev 서버를 띄운 뒤 두 뷰포트(1280×800, 375×812)마다:
   - 변경된 화면을 열고, **이번 변경이 추가한 요소가 보일 때까지 기다린 뒤** 스크린샷 (캐시된 옛 페이지 방지)
   - `console`·`errors`로 콘솔 error와 잡히지 않은 예외 수집
   - UI 변경 범위에 `a11y --selector <변경 영역>` — 결과의 critical/serious는 4단계 a11y 리뷰에 같이 넘긴다
   - 로딩·레이아웃이 바뀐 변경이면 `vitals`로 LCP·CLS를 REPORT.md에 남긴다
1. 프로젝트에 Playwright(`@playwright/test` 또는 `playwright`)가 있으면: dev 서버를 띄우고 1280×800, 375×812 두 뷰포트로 변경된 화면을 찍는다. `page.on('console')`로 error 레벨 메시지를 모은다. **이번 변경이 추가한 DOM 요소를 `expect(locator).toBeVisible()`로 단언**한다 — 캐시된 옛 페이지를 찍는 사고 방지.
2. 위 둘이 없고 브라우저 도구(Claude in Chrome / 내장 브라우저)가 있으면: dev 서버 띄우고 같은 두 뷰포트로 확인하고 스크린샷을 남긴다.
   로딩·레이아웃·늦게 채워지는 값(카운트다운, 건수, 클라이언트 시간)을 건드렸으면 페이지를 새로 연 뒤 JS로 CLS를 재서 REPORT.md에 남긴다(통과 기준 0.05 이하):
   `await new Promise(r => { let s = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) s += e.value; }).observe({ type: "layout-shift", buffered: true }); setTimeout(() => r(s), 3000); })`
3. 모두 없으면: 이 단계를 건너뛰었다고 **명시적으로** 보고한다. 건너뛴 걸 숨기지 않는다.

스크린샷은 `.claude/verify/<branch>/` 아래에 저장한다 (gitignore 대상).

통과 기준: 콘솔 error 0, 두 뷰포트에서 가로 스크롤 없음, SPEC.md 완료 조건의 "보여야 할 것"이 보임.

## 3. 단순화
`/simplify`를 돌린다. 결과 중 **동작을 바꾸지 않는** 제안만 적용한다. 적용 후 1단계를 다시 돈다.

## 4. 리뷰 (깨끗한 컨텍스트)
변경 파일 목록을 넘겨 두 에이전트를 병렬로 돌린다:
- `binary-agents:a11y-reviewer` — UI 변경이 있을 때
- `binary-agents:react-state-reviewer` — 상태·훅·Context 변경이 있을 때

🔴 항목은 고치고 1단계부터 다시. 🟡은 PR 본문 "리뷰 포인트"에 적는다. 스타일 지적은 여기서 다루지 않는다 (`/binary-agents:fundamentals-review`는 사람이 필요할 때 따로 호출).

## 5. 검증 리포트 (커밋·PR은 하지 않는다)
`.claude/verify/<branch>/REPORT.md`에 아래를 쓴다. 나중에 `/binary-agents:pr`이 이 파일을 PR 본문에 붙인다.
- 실행한 명령과 결과 (typecheck / lint / test 통과 여부, 테스트 개수)
- 스크린샷 경로 (두 뷰포트) 또는 "브라우저 검증 건너뜀: <이유>"
- 영향 범위 (1.5 단계 결과)
- 리뷰어 🟡 항목
- 건드리지 않은 것 (SPEC.md의 "건드리지 않는 것" 그대로)

**git commit, git push, gh pr create 를 실행하지 않는다.** 커밋과 PR은 사용자가 `/binary-agents:commit`, `/binary-agents:pr`로 한다.

## 마지막 출력
세 줄만:
1. 통과한 검사 요약 (예: `typecheck ✓ test 14/14 ✓ 스크린샷 2장 ✓ 콘솔 0 ✓ 영향 범위 3곳 ✓`)
2. 사람이 봐야 할 것이 있으면 그것만 (없으면 "없음")
3. `다음: /binary-agents:commit → /binary-agents:pr`
