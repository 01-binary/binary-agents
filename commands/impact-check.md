---
description: git diff를 분석하여 작업 내용을 정리하고 side effect를 엄밀하게 검증
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(git rev-parse:*), Bash(git show:*), Read, Glob, Grep
---

# 변경사항 영향 분석기

git diff를 분석하여 **무엇을 했는지** 정리하고, **의도하지 않은 side effect가 없는지** 엄밀하게 검증합니다.

## 컨텍스트 정보

**분석 대상 (인자):**
!`echo "${1:-}"`

**현재 브랜치:**
!`git rev-parse --abbrev-ref HEAD`

**Main 브랜치:**
!`git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main"`

**현재 git 상태:**
!`git status --short`

**Staged 변경사항 요약:**
!`git diff --cached --stat`

**Unstaged 변경사항 요약:**
!`git diff --stat`

**브랜치 vs main 요약:**
!`git diff --stat main..HEAD 2>/dev/null || git diff --stat origin/main..HEAD 2>/dev/null || echo "비교 불가"`

**브랜치의 커밋 목록:**
!`git log --oneline main..HEAD 2>/dev/null || git log --oneline origin/main..HEAD 2>/dev/null || echo "커밋 없음"`

## 작업 순서

### 1. 분석 범위 결정

사용자가 인자로 범위를 지정했는지 확인:

| 인자 | 분석 범위 |
|------|-----------|
| 없음 | **자동 선택**: staged가 있으면 staged, 없으면 브랜치 vs main |
| `staged` | `git diff --cached` |
| `unstaged` | `git diff` |
| `all` | `git diff HEAD` (staged + unstaged) |
| `branch` | `git diff main..HEAD` |
| `<커밋해시>` | `git show <해시>` |
| `<해시1>..<해시2>` | `git diff <해시1>..<해시2>` |

결정된 범위를 사용자에게 알리고 진행.

### 2. 변경사항 수집

결정된 범위로 상세 diff 수집:

```bash
git diff <범위>                    # 전체 diff
git diff <범위> --name-status      # 파일별 상태 (A/M/D/R)
```

### 3. 작업 내용 정리

변경사항을 논리적 단위로 그룹화:

- **의도 파악**: 이 변경의 목적은 무엇인가? (기능 추가/버그 수정/리팩토링/설정 변경 등)
- **논리 단위 그룹핑**: 관련 파일들을 묶어서 "무슨 작업인지" 설명
- **파일별 변경 요약**: 각 파일에서 구체적으로 뭐가 바뀌었는지

### 4. Side Effect 엄밀 체크

**각 변경사항에 대해 아래 체크리스트를 전부 수행.** 각 항목마다 `Grep`, `Read`, `Glob`을 사용해 실제로 검증:

#### 4-1. 심볼 사용처 분석 (필수)

변경된 **함수/변수/클래스/타입의 이름**을 추출하고, 프로젝트 전체에서 사용처를 `Grep`으로 찾기:

- **삭제된 심볼**: 아직 참조하는 곳이 있는가? → 🔴 빌드 실패
- **이름이 변경된 심볼**: 옛 이름을 쓰는 곳이 남아있는가? → 🔴 빌드 실패
- **시그니처가 변경된 함수**: 호출부들이 새 시그니처와 호환되는가? → 🔴 런타임 에러 가능성

#### 4-2. Public API / Export 변경

- `export` 된 심볼이 추가/삭제/변경되었는가?
- 외부 패키지/다른 모듈에서 import하는가? → 🔴 breaking change
- `index.ts` 같은 barrel file을 통해 재노출되는가?

#### 4-3. 타입 변경의 전파 (TypeScript)

- 타입 정의가 변경되었는가? (`interface`, `type`, `enum`)
- 이 타입을 참조하는 파일이 몇 개나 되는가?
- 필드 추가는 안전하지만 **필드 삭제/이름 변경/타입 변경**은 전파 확인 필수

#### 4-4. 시그니처 변경

- 함수 파라미터 추가/삭제/순서 변경?
- Optional → Required?
- 반환 타입 변경? (narrower면 OK, wider면 위험)
- 호출부를 모두 찾아서 영향 분석

#### 4-5. 설정/환경 변경

다음 파일들이 변경되었는지 확인하고, 변경 시 **다른 팀원/환경에 미치는 영향** 언급:

- `package.json` (dependencies, scripts)
- `tsconfig.json`, `jest.config.*`, `vite.config.*`, `next.config.*` 등
- `.env*` 파일
- CI 설정 (`.github/workflows/`)
- Docker, Dockerfile, docker-compose

#### 4-6. 암묵적 동작 변경

- 기본값이 변경되었는가?
- 조건문의 조건이 바뀌었는가?
- 에러 처리 로직이 바뀌었는가? (throw → catch 등)
- 비동기 처리가 바뀌었는가? (await 추가/삭제, Promise 체인)
- 상태 업데이트 타이밍이 바뀌었는가?

#### 4-7. 테스트 영향

- 테스트 파일이 함께 업데이트되었는가?
- 변경된 코드에 대응하는 테스트가 존재하는가?
- 테스트가 없는 critical path 변경이 있는가?

#### 4-8. 외부 의존성

- import 경로가 변경되었는가? (파일 이동/리네임)
- 삭제된 파일이 다른 곳에서 import되고 있는가?
- 새로 추가된 라이브러리가 `package.json`에 반영되었는가?

### 5. 리스크 수준 평가

발견된 side effect를 3단계로 분류:

| 수준 | 기준 |
|------|------|
| 🔴 **High** | 빌드 실패, 런타임 에러, breaking change가 확실한 경우 |
| 🟡 **Medium** | 동작이 바뀔 가능성, 테스트 누락, 의도치 않은 전파 가능 |
| 🟢 **Low** | 주의할 점이지만 기능적 영향 없음 |

## 출력 형식

```markdown
# 변경사항 영향 분석

## 분석 정보
- **분석 범위:** [staged / branch vs main / 커밋 범위]
- **변경 파일:** N개 (추가: X, 수정: Y, 삭제: Z)
- **변경 규모:** +A / -B 라인

---

## 📋 작업 내용 요약

### 주요 의도
[한 줄로 이 변경의 핵심 목적]

### 논리 단위별 작업

#### 1. [작업 단위명]
- **영향 파일:** `file1.ts`, `file2.ts`
- **변경 내용:** [구체적으로 뭐가 바뀌었는지]

#### 2. [작업 단위명]
- **영향 파일:** `...`
- **변경 내용:** `...`

---

## ⚠️ Side Effect 검증 결과

### 요약

| 수준 | 개수 |
|------|------|
| 🔴 High | X |
| 🟡 Medium | Y |
| 🟢 Low | Z |

---

### 🔴 High Risk

#### 1. [이슈 제목]
- **위치:** `src/file.ts:42`
- **문제:** [구체적으로 뭐가 문제인지]
- **검증 방법:** [이걸 어떻게 확인했는지 - 예: Grep으로 사용처 검색]
- **영향 범위:** [어떤 파일들이 영향받는지]
  - `src/components/A.tsx:15` - 삭제된 함수 `foo()` 호출
  - `src/hooks/useB.ts:30` - 동일
- **권장 조치:** [구체적으로 어떻게 해결해야 하는지]

---

### 🟡 Medium Risk

#### 1. [이슈 제목]
- **위치:** `...`
- **문제:** `...`
- **영향 범위:** `...`
- **권장 조치:** `...`

---

### 🟢 Low Risk

| 위치 | 주의사항 |
|------|----------|
| `file.ts:10` | [간단한 주의 포인트] |

---

## ✅ 체크리스트 검증 결과

| 항목 | 결과 |
|------|------|
| 4-1. 심볼 사용처 분석 | ✅ / ⚠️ / ❌ |
| 4-2. Public API 변경 | ✅ / ⚠️ / ❌ |
| 4-3. 타입 전파 | ✅ / ⚠️ / ❌ |
| 4-4. 시그니처 변경 | ✅ / ⚠️ / ❌ |
| 4-5. 설정/환경 변경 | ✅ / ⚠️ / ❌ |
| 4-6. 암묵적 동작 변경 | ✅ / ⚠️ / ❌ |
| 4-7. 테스트 영향 | ✅ / ⚠️ / ❌ |
| 4-8. 외부 의존성 | ✅ / ⚠️ / ❌ |

---

## 💡 최종 권고

[종합적인 판단: 커밋/PR 진행 가능 여부, 추가 작업 필요 항목]
```

## 사용 예시

```bash
# 자동 선택 (staged 우선, 없으면 브랜치 vs main)
/impact-check

# staged만 분석
/impact-check staged

# 브랜치 전체 분석
/impact-check branch

# 특정 커밋 분석
/impact-check f47ba2d

# 커밋 범위 분석
/impact-check 6434191..f47ba2d
```

## 중요 사항

- **추측하지 말고 검증하기** - "아마 영향 없을 것" 같은 표현 금지. 반드시 `Grep`으로 사용처를 찾아 근거를 제시
- **False positive 허용** - 불확실하면 🟡로 분류하고 사용자가 판단하게 함. 놓치는 것보다 낫다
- **빈 체크리스트 항목도 명시** - "확인한 결과 해당사항 없음"을 ✅로 표시
- **구체적 file:line** - 모든 지적에 정확한 파일 경로와 라인 번호 필수
- **코드 수정은 하지 않음** - 분석과 경고만 제공
- **한국어 출력**
