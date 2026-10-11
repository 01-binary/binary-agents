---
description: Fundamentals 4원칙 + 근본 원인 + 접근성 + 상태관리 관점을 병렬로 리뷰하고, 이슈 단위로 합쳐 원칙 충돌까지 판단
argument-hint: "[branch|staged|unstaged|<경로>] [--save]"
allowed-tools: Task, Agent, Skill, Read, Glob, Grep, Write, Bash(git status:*), Bash(git diff:*), Bash(git ls-files:*), Bash(git merge-base:*), Bash(git rev-parse:*), Bash(git symbolic-ref:*), Bash(git branch:*)
---

# Fundamentals 리뷰

Toss Frontend Fundamentals 기준의 여러 관점을 병렬로 실행하고, 결과를 **이슈 단위**로 합쳐서 원칙끼리 부딪히는 제안까지 판단하는 리뷰 커맨드입니다.

**인자:** $ARGUMENTS

## 사용 예시

```bash
/fundamentals-review                 # 브랜치 변경 전부 (기본)
/fundamentals-review staged          # git add 한 것만
/fundamentals-review unstaged        # git add 안 한 로컬 변경과 새 파일만
/fundamentals-review src/features    # 경로의 파일 전체 (과제 코드처럼 처음 보는 코드)
/fundamentals-review staged --save   # 결과를 fundamentals-review.md로 저장
```

## 사용 관점

| 관점 | 에이전트 | 실행 조건 |
|------|----------|----------|
| 가독성 | `fundamentals-readability` | 항상 |
| 예측 가능성 | `fundamentals-predictability` | 항상 |
| 응집도 | `fundamentals-cohesion` | 항상 |
| 결합도 | `fundamentals-coupling` | 항상 |
| 근본 원인 | `root-cause-reviewer` | 항상 |
| 접근성 | `a11y-reviewer` | 범위에 `.tsx`·`.jsx` 파일이 있을 때 |
| 상태관리 | `react-state-reviewer` | React 프로젝트일 때 |

판단 기준이 되는 스킬: `fe-readability`, `fe-predictability`, `fe-cohesion`, `fe-coupling`(4원칙), `fe-tradeoffs`(원칙 충돌과 예외), `fe-root-cause`, `fe-a11y`, `fe-state`(상태 배치). 각 에이전트가 자기 스킬을 미리 불러옵니다.

## 작업 순서

### 1. 인자 해석

- `--save`가 있으면 저장 모드로 표시하고 나머지 토큰을 봅니다.
- 첫 토큰이 `branch` 또는 없음 → **branch** 모드
- `staged` → **staged** 모드
- `unstaged` → **unstaged** 모드
- 그 밖의 값 → **경로** 모드 (그 경로의 파일 전체)

### 2. 리뷰 대상 수집

git 명령은 하나씩 실행하고 결과를 다음 명령에 넣습니다(`$(...)` 치환을 쓰지 않습니다).

**기본 브랜치 찾기** (branch 모드만): `git symbolic-ref --short refs/remotes/origin/HEAD`의 결과(예: `origin/main`)를 씁니다. 실패하면 `git rev-parse --verify main`, 그다음 `master` 순서로 확인합니다.

| 모드 | 변경 파일 목록 | 변경 줄 범위 |
|------|--------------|-------------|
| branch | `git merge-base <기본 브랜치> HEAD`로 기준 커밋을 구한 뒤 `git diff --name-only <기준 커밋>` + `git ls-files --others --exclude-standard` | `git diff -U0 <기준 커밋>` |
| staged | `git diff --cached --name-only` | `git diff --cached -U0` |
| unstaged | `git diff --name-only` + `git ls-files --others --exclude-standard` | `git diff -U0` |
| 경로 | `Glob`으로 경로 아래 코드 파일 | 파일 전체 |

- branch 모드는 기준 커밋과 **현재 작업 트리**를 비교하므로 커밋, staged, 로컬 변경이 모두 들어갑니다. 새 파일은 `ls-files`로 더합니다.
- 기본 브랜치 위에서 실행하면 아직 커밋하지 않은 변경과 push하지 않은 커밋만 잡힙니다.
- 코드 파일(`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`)만 남기고 `node_modules`, `dist`, `build`, `*.d.ts`, lock 파일은 뺍니다.
- 변경 줄 범위는 hunk 헤더 `@@ -a,b +c,d @@`의 `c`부터 `c+d-1`까지입니다. `,d`가 없으면(`+c`) 한 줄입니다. 새 파일은 "전체"로 표시합니다. 삭제만 있는 hunk(`d`가 0)는 "c줄 근처 삭제"로 적습니다.
- 대상이 없으면 "리뷰할 변경이 없습니다"와 함께 다른 모드를 안내하고 끝냅니다.

수집 결과를 아래 **리뷰 범위 블록**으로 만듭니다.

```
리뷰 범위: branch 모드 (기준 origin/main, abc1234)
- src/pages/home-page.tsx: 12-30, 45-47
- src/hooks/post.ts: 새 파일(전체)
```

### 3. 관점 선택

- 항상: fundamentals 4개 + `root-cause-reviewer`
- 범위에 `.tsx`·`.jsx`가 있으면: `a11y-reviewer`
- `package.json`에 `react` 또는 `next` 의존성이 있으면: `react-state-reviewer`

### 4. 병렬 실행

선택한 에이전트를 **한 메시지에서 동시에** 실행합니다. 각 에이전트 프롬프트:

```
[리뷰 범위 블록]

위 범위의 코드를 [관점] 관점으로 리뷰하세요.
- 변경된 줄과, 그 변경이 직접 영향을 주는 코드만 이슈로 올리세요. 범위 밖 문제는 "범위 밖 참고"로 짧게 적으세요. (경로 모드에서는 범위의 파일 전체가 대상입니다.)
- 이해에 필요하면 범위 밖 파일을 읽어도 됩니다.
- 모든 이슈에 file:line과 확신도(높음/중간/낮음)를 적으세요.
```

### 5. 결과 합치기 (메인이 직접)

먼저 Skill 도구로 `fe-tradeoffs`를 불러옵니다.

1. **같은 문제 묶기**: 위치가 같거나 원인이 같은 지적은 한 이슈로 합치고, 해당하는 원칙 태그를 모두 붙입니다. 어느 관점에서 나왔는지도 남깁니다.
2. **원칙 충돌 판단**: 관점끼리 반대 방향을 제안하면(예: 응집도는 공통화, 결합도는 중복 허용) `fe-tradeoffs`의 판단 기준으로 한쪽을 고르고 근거를 남깁니다. 코드만으로 판단할 수 없으면 "확인 필요"와 함께 무엇을 확인해야 하는지 적습니다.
3. **걸러내기**: `fe-tradeoffs`의 "원칙을 깨도 되는 경우"에 해당하는 지적은 빼고, 수정 방법이 "하지 말아야 할 제안"이면 고치거나 뺍니다.
4. **검증**: Critical 후보는 메인이 해당 `file:line`을 직접 열어 확인합니다. 코드와 맞지 않으면 버리고, 판단이 범위 밖 코드에 달려 있으면 확신도를 낮춰 Recommended로 내립니다. 확신도 "낮음"은 Critical에 두지 않습니다.
5. **루브릭 태그**: 이슈마다 해당하는 것을 모두 붙입니다.
   - ① 코드 모습: 가독성·예측 가능성·응집도·결합도, 추상화, 상태 배치
   - ② 기술 부채: 데드코드, 같은 일을 두 가지 방식으로 하는 코드, 의존성 중복·미사용, 낡은 API
   - ③ 근본 원인: 버그, 증상을 덮는 코드, 조용한 실패
   - ④ 사용자 경험: 접근성, 사용자에게 보이는 로딩·에러·빈 상태, 입력 흐름
6. **근거 한 문장**: 이슈마다 "왜 문제인가"를 동료에게 말하듯 한 문장으로 씁니다. 원칙 이름만 대지 말고, 이 코드에서 무엇이 어려워지는지 말합니다.
7. **정렬**: 사용자에게 보이는 문제(③④)와 변경 위험이 큰 것부터 둡니다.

### 6. 출력

아래 형식으로 화면에 출력합니다.

````markdown
# Fundamentals 리뷰 결과

## 요약
- **리뷰 범위:** [branch (origin/main 대비) | staged | unstaged | 경로] · 파일 N개
- **실행한 관점:** [목록]
- **발견:** Critical X · Recommended Y · Best Practices Z
- **한 줄 총평:** [가장 먼저 손볼 것]

---

## Critical (먼저 고칠 것)

### 1. [이슈 제목]
- **위치:** `file:line`
- **원칙:** 가독성 · 응집도 | **루브릭:** ① ③ | **확신도:** 높음 | **발견 관점:** readability, root-cause
- **문제:** [무엇이 왜 문제인지]
- **근거 한 문장:** [동료에게 말하듯]
- **수정 방향:**
```tsx
// 개선 코드
```

---

## Recommended (권장)

[같은 형식]

---

## 원칙 충돌과 판단

| 위치 | 부딪힌 제안 | 택한 쪽 | 근거 (fe-tradeoffs 판단 기준) |
|------|-----------|--------|------------------------------|

---

## Best Practices (잘한 점)

- [내용] — `file:line` (관점)

---

## 범위 밖 참고

- [변경 범위 밖에서 발견한 문제] — `file:line`

---

## Metrics

| 관점 | Critical | Recommended | Best Practices |
|------|----------|-------------|----------------|
````

### 7. 저장 (`--save`일 때만)

- 저장 모드가 아니면 파일을 만들지 않습니다.
- 저장 모드면 `git rev-parse --show-toplevel`(실패하면 현재 폴더) 아래 `fundamentals-review.md`에 씁니다. 파일이 이미 있으면 기존 내용을 읽고 `---` 구분선 뒤에 이어 붙입니다.

## 중요 사항

- **리뷰만 합니다.** 코드를 고치지 않습니다.
- **병렬 실행:** 관점 에이전트는 한 메시지에서 동시에 실행합니다.
- **file:line 보존:** 실행 가능한 피드백을 위해 필수입니다.
- **한국어 출력:** 최종 리포트는 한국어로 씁니다.
- **AI attribution 금지:** "Generated by AI" 같은 문구를 붙이지 않습니다.
