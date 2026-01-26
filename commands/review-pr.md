---
description: PR 링크를 받아 변경사항을 분석하고 GitHub 스타일로 라인별 코드 리뷰 제공
allowed-tools: Task, Skill, Bash(gh pr:*), Bash(gh api:*), Read, Glob, Grep
---

# PR 코드 리뷰어

GitHub PR 링크를 받아 변경된 파일들을 분석하고, 실제 GitHub 리뷰처럼 라인별 코멘트를 제공합니다.

## 컨텍스트 정보

**PR 링크 또는 번호:**
!`echo "${1:-}"`

## 사용 가능한 리뷰 에이전트

Task 도구를 통해 다음 전문 에이전트를 사용할 수 있습니다:

| Agent | 초점 영역 |
|-------|----------|
| `code-reviewer` | 아키텍처, 타입 안전성, 에러 처리, 테스트, 접근성, 보안 |
| `fundamentals-code` | Toss Frontend Fundamentals 기반 (가독성, 예측 가능성, 응집도, 결합도) |
| `refactor-analyzer` | 코드 중복, 복잡성, 추상화 기회, 코드 스멜 |
| `junior-checker` | 주니어 개발자 관점 가독성, 네이밍, 복잡도 |
| `react-performance-optimizer` | React 리렌더, 메모이제이션, 훅 최적화 |
| `react-principles-reviewer` | React 개발 원칙 (응집도/명시성, Props 관리, 네이밍, 부수효과, AsyncBoundary) |

## 사용 가능한 Skill

Skill은 사용자 설치에 따라 다르며 추가 리뷰 가이드라인/컨텍스트를 제공합니다:
- `vercel-react-best-practices` - Vercel의 React/Next.js 최적화 가이드라인
- 커스텀 팀 코딩 표준
- 프레임워크별 best practices

**참고:** Skill은 Skill 도구로 로드되며 직접 분석이 아닌 리뷰 컨텍스트를 제공합니다.

## 작업 순서

1. **PR 정보 가져오기**

   ```bash
   # PR 정보
   gh pr view <PR번호> --json title,body,author,baseRefName,headRefName,changedFiles,additions,deletions

   # 변경된 파일 목록
   gh pr diff <PR번호> --name-only

   # 변경 내용 (diff)
   gh pr diff <PR번호>
   ```

2. **사용자에게 리뷰 유형 질문** (AskUserQuestion 사용)

   옵션 제시:

   | 옵션 | 이름 | 사용 에이전트 | 적합한 상황 |
   |------|------|--------------|-------------|
   | 1 | **전체 리뷰** | 모든 6개 에이전트 병렬 실행 | 종합 코드 리뷰 (권장) |
   | 2 | **커스텀** | 사용자가 직접 선택 | 특정 관점만 리뷰하고 싶을 때 |

3. **Skill 포함 여부 질문** (AskUserQuestion 사용)

   리뷰 유형 선택 후:
   > "포함할 skill이 있나요? (예: `vercel-react-best-practices`, 팀 코딩 가이드 등)"

   옵션:
   - **없음** - skill 없이 에이전트만 실행
   - **있음** - skill 이름 입력받아서 로드

   사용자가 skill 이름 제공 시:
   - 에이전트 실행 전 `Skill(<skill-name>)`으로 각 skill 로드
   - Skill은 리뷰를 위한 추가 컨텍스트/가이드라인 제공

4. **선택된 에이전트 병렬 실행**

   Task 도구로 에이전트를 **동시에** 실행. 각 에이전트에게 **PR 번호만 전달**하고, 에이전트가 직접 diff를 가져오게 함:

   ```
   Task(code-reviewer): "PR #<PR번호>를 리뷰해주세요.

   [작업 순서]
   1. `gh pr view <PR번호> --json title,body,author,baseRefName,headRefName,changedFiles,additions,deletions`로 PR 정보 확인
   2. `gh pr diff <PR번호>`로 전체 변경사항 확인
   3. 필요 시 `Read` 도구로 변경된 파일의 전체 컨텍스트 확인

   [리뷰 관점]
   아키텍처, 타입 안전성, 에러 처리, 테스트, 접근성, 보안

   [출력 형식]
   - GitHub 리뷰 스타일로 file:line 참조와 함께 발견사항 반환
   - 심각도를 Must Fix / Should Fix / Consider / Suggestion으로 구분"

   Task(fundamentals-code): "PR #<PR번호>를 Toss Frontend Fundamentals 원칙으로 분석해주세요.

   [작업 순서]
   1. `gh pr view <PR번호>`로 PR 정보 확인
   2. `gh pr diff <PR번호>`로 전체 변경사항 확인
   3. 필요 시 관련 파일 Read

   [리뷰 관점]
   가독성, 예측 가능성, 응집도, 결합도 4가지 관점에서 점수화하고 리뷰"

   Task(refactor-analyzer): "PR #<PR번호>에서 리팩토링 기회를 찾아주세요.

   [작업 순서]
   1. `gh pr view <PR번호>`로 PR 정보 확인
   2. `gh pr diff <PR번호>`로 전체 변경사항 확인
   3. 필요 시 관련 파일 Read

   [리뷰 관점]
   코드 중복, 복잡성, 추상화 기회, 코드 스멜, 아키텍처 부채"

   Task(junior-checker): "PR #<PR번호>가 주니어 개발자에게 이해하기 쉬운지 분석해주세요.

   [작업 순서]
   1. `gh pr view <PR번호>`로 PR 정보 확인
   2. `gh pr diff <PR번호>`로 전체 변경사항 확인
   3. 필요 시 관련 파일 Read

   [리뷰 관점]
   네이밍, 함수 복잡도, 주석, 구조, 타입, 학습 곡선"

   Task(react-performance-optimizer): "PR #<PR번호>에서 React 성능 이슈를 찾아주세요.

   [작업 순서]
   1. `gh pr view <PR번호>`로 PR 정보 확인
   2. `gh pr diff <PR번호>`로 전체 변경사항 확인
   3. 필요 시 관련 파일 Read

   [리뷰 관점]
   리렌더링, Context 분할, 훅 의존성, 메모이제이션, React 19+ 패턴"
   ```

5. **결과 종합**
   - 모든 에이전트 결과 수집
   - 중복 발견사항 제거
   - 심각도별 정렬
   - GitHub 리뷰 스타일로 포맷팅

## Output Format

```markdown
# PR 코드 리뷰

## PR 정보
- **제목:** [PR 제목]
- **작성자:** @[author]
- **브랜치:** [head] → [base]
- **변경:** +[additions] -[deletions] in [files] files

---

## 리뷰 요약

| 심각도 | 개수 |
|--------|------|
| 🔴 Must Fix | X |
| 🟡 Should Fix | Y |
| 🟢 Consider | Z |
| 💡 Suggestion | W |

---

## 🔴 Must Fix (반드시 수정)

### `src/components/UserProfile.tsx:42`
**[카테고리]** 타입 안전성
**[발견 에이전트]** code-reviewer

현재 코드:
```tsx
const user: any = response.data
```

문제:
- `any` 타입 사용으로 타입 안전성 상실

제안:
```tsx
const user: User = response.data
```

---

## 🟡 Should Fix (권장 수정)

### `src/hooks/useAuth.ts:15-20`
**[카테고리]** 에러 처리
**[발견 에이전트]** code-reviewer

[같은 형식...]

---

## 🟢 Consider (고려 사항)

[같은 형식...]

---

## 💡 Suggestions (제안)

[같은 형식...]

---

## ✅ 잘한 점

- `src/hooks/useUser.ts` - 훅 분리가 잘 되어 있음 (fundamentals-code)
- `src/types/index.ts` - 타입 정의가 명확함 (code-reviewer)

---

## 에이전트별 요약

### Code Reviewer
[주요 발견사항]

### Fundamentals Code
[주요 발견사항]

### Refactor Analyzer
[주요 발견사항]

### Junior Checker
[주요 발견사항]

### React Performance Optimizer
[주요 발견사항]

---

## 다음 단계

1. **즉시:** 🔴 Must Fix 항목 수정
2. **이번 PR:** 🟡 Should Fix 항목 검토
3. **추후:** 🟢 Consider 항목 백로그에 추가
```

## 사용 예시

```bash
# PR 번호로
/review-pr 123

# PR URL로
/review-pr https://github.com/owner/repo/pull/123
```

## 중요 사항

- **병렬 실행** - 에이전트를 동시에 실행하여 효율적으로 리뷰
- **변경된 파일만 분석** - 전체 코드베이스가 아닌 PR diff만 리뷰
- **라인 번호 정확히** - diff에서 실제 라인 번호 추출하여 GitHub에서 바로 찾을 수 있도록
- **구체적 제안** - 문제만 지적하지 말고 해결책 제시
- **한국어 출력** - 최종 리포트는 한국어로
- **심각도 구분** - Must/Should/Consider/Suggestion으로 우선순위화
- **발견 에이전트 표시** - 어떤 에이전트가 발견했는지 명시
