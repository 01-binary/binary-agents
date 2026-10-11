---
description: PR 리뷰 코멘트를 분석하여 개선 필요 여부를 판단하고 변경 방법과 답글 초안 제시 (resolve된 스레드 제외)
argument-hint: "[PR 번호 또는 URL]"
allowed-tools: Bash(gh pr:*), Bash(gh api:*), Bash(git diff:*), Bash(git rev-parse:*), Bash(git log:*), Bash(git remote:*), Read, Glob, Grep, Skill
---

# PR 리뷰 코멘트 분석기

PR의 리뷰 코멘트를 가져와서, 각 코멘트가 실제로 개선이 필요한지 판단하고, 필요하다면 구체적인 변경 방법을 제시합니다. 논의가 필요한 코멘트에는 근거를 담은 답글 초안을 붙입니다.

**인자:** $ARGUMENTS (비어 있으면 현재 브랜치의 PR)

## 컨텍스트 정보

**현재 브랜치:**
!`git rev-parse --abbrev-ref HEAD`

PR 정보와 코멘트는 아래 1단계에서 조회합니다.

## 작업 순서

1. **PR 존재 확인과 코멘트 조회** (명령은 하나씩 실행합니다)
   - `gh pr view [인자로 받은 PR 번호 또는 URL] --json number,title,state,author,url,reviewDecision,reviews,comments`로 PR 정보, 리뷰 요약, 일반 코멘트를 한 번에 가져옵니다. 인자가 없으면 현재 브랜치의 PR을 봅니다. 실패하면 PR이 없는 것이므로 사용자에게 안내하고 종료합니다.
   - 라인별 리뷰 스레드는 GraphQL로 가져와 **resolve되지 않은 것만** 남깁니다. resolve된 스레드 수는 따로 세어 둡니다.

     ```bash
     gh api graphql -F owner='{owner}' -F repo='{repo}' -F number=<PR 번호> \
       -f query='query($owner: String!, $repo: String!, $number: Int!) { repository(owner: $owner, name: $repo) { pullRequest(number: $number) { reviewThreads(first: 100) { nodes { isResolved isOutdated path line comments(first: 50) { nodes { author { login } body url } } } } } } }' \
       --jq '.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved | not) | "---\n파일: \(.path):\(.line // "outdated")\n상태: \(if .isOutdated then "outdated" else "current" end)\n" + ([.comments.nodes[] | "작성자: \(.author.login)\n내용: \(.body)\n링크: \(.url)"] | join("\n"))'
     ```

     - `{owner}`, `{repo}`는 gh가 현재 레포 기준으로 채웁니다.
     - `git remote get-url origin`의 호스트가 github.com이 아니면(GitHub Enterprise) `gh api --hostname <호스트> graphql ...`로 호출합니다.
     - 스레드는 첫 코멘트가 원래 지적이고, 이어지는 코멘트는 그에 대한 답글입니다. 대화 흐름을 함께 읽습니다.
   - PR 번호, 제목, 리뷰 상태, resolve된 스레드 수를 표시합니다.

2. **코멘트 수집 및 분류**

   GitHub PR에는 3가지 유형의 코멘트가 존재:

   | 유형 | API | 설명 |
   |------|-----|------|
   | **Review threads** | GraphQL `reviewThreads` | 특정 코드 라인에 달린 코멘트와 답글 (가장 중요, resolve된 것은 제외) |
   | **Issue comments** | PR의 `comments` 필드 | PR 전체에 대한 일반 코멘트 |
   | **Review summaries** | PR의 `reviews` 필드 | 리뷰 승인/변경요청 시 남긴 요약 |

   모든 유형을 수집하되, **Review threads (라인별 코멘트)** 를 우선 분석

3. **각 코멘트 분석**

   각 코멘트에 대해 다음을 판단:

   - **코멘트가 가리키는 파일과 라인**을 `Read`로 읽어서 현재 코드 상태 확인
   - 코멘트의 의도 파악 (버그 지적, 개선 제안, 질문, 칭찬, 스타일 의견 등)
   - **이미 해결되었는지** 확인 (코드가 이미 수정된 경우)
   - 코멘트가 유효한 개선점인지 판단
   - **코드 품질에 관한 코멘트**(공통화·추상화, 이름, 구조, 상태 위치, 컴포넌트 패턴, 접근성, 에러 처리 등)는 관련 스킬을 Skill 도구로 불러와 판단 근거로 씁니다.
     - 가독성·예측 가능성·응집도·결합도: `fe-readability`, `fe-predictability`, `fe-cohesion`, `fe-coupling`
     - 원칙끼리 부딪히는 제안(예: "공통 훅으로 빼세요" vs 중복 허용): `fe-tradeoffs`
     - 상태 위치: `fe-state` / 컴포넌트 패턴: `fe-react` / 접근성: `fe-a11y` / 버그·에러 처리: `fe-root-cause`

4. **코멘트 분류**

   각 코멘트를 다음 중 하나로 분류:

   | 분류 | 기준 |
   |------|------|
   | 🔴 **개선 필요** | 버그, 보안 이슈, 명확한 코드 품질 문제 지적. 코드 변경이 필요함 |
   | 🟡 **논의 필요** | 설계 방향, 트레이드오프가 있는 제안. 판단이 필요함 |
   | 🟢 **조치 불필요** | 칭찬, 단순 질문, 이미 해결됨, 스타일 취향 차이 |

   - 리뷰어의 제안이 스킬 기준과 다르면(예: `fe-tradeoffs`의 "원칙을 깨도 되는 경우"에 해당하거나 "하지 말아야 할 제안"인 경우) 🔴가 아니라 🟡로 분류하고, 어떤 기준과 다른지 적습니다.
   - 스타일 취향 차이(중괄호, 따옴표 등)는 린터로 정할 문제라고 적고 🟢로 둡니다.

5. **개선 방법 제시**

   🔴, 🟡로 분류된 항목에 대해:
   - **왜** 바꿔야 하는지 (코멘트 작성자의 의도 + 기술적 근거)
   - **어떻게** 바꿔야 하는지 (구체적인 코드 변경 방향 제시)
   - 필요하면 관련 파일을 `Read`로 읽어 전체 맥락 파악

6. **🟡 답글 초안 작성**

   리뷰어에게 보낼 답글을 초안으로 씁니다. **GitHub에 게시하지 않습니다.**
   - 결론을 먼저 씁니다 (반영할지, 현재 방식을 유지하자고 제안할지)
   - 객관적 근거를 붙입니다: 코드에서 확인한 사실, 스킬 기준, 트레이드오프
   - 상대 의견에서 맞는 부분은 인정하고, 다른 선택지가 있으면 함께 제시합니다
   - 2~4문장, 존중하는 어조, 한국어

## 출력 형식

```markdown
# PR 리뷰 코멘트 분석

## PR 정보
- **제목:** [PR 제목]
- **번호:** #[number]
- **URL:** [PR URL]
- **리뷰 상태:** [APPROVED / CHANGES_REQUESTED / REVIEW_REQUIRED]
- **총 코멘트:** N개

---

## 분석 요약

| 분류 | 개수 |
|------|------|
| 🔴 개선 필요 | X |
| 🟡 논의 필요 | Y |
| 🟢 조치 불필요 | Z |
| resolve된 스레드 (분석 제외) | R |

---

## 🔴 개선 필요

### 1. [코멘트 요약]
- **작성자:** @[author]
- **위치:** `file/path.ts:42`
- **원본 코멘트:** > [코멘트 내용]

**왜 바꿔야 하는가:**
[기술적 근거와 코멘트 작성자의 의도 설명]

**어떻게 바꿔야 하는가:**
현재 코드:
```[lang]
// 현재 코드
```

제안하는 변경:
```[lang]
// 변경된 코드
```

---

## 🟡 논의 필요

### 1. [코멘트 요약]
- **작성자:** @[author]
- **위치:** `file/path.ts:15`
- **원본 코멘트:** > [코멘트 내용]

**코멘트 분석:**
[코멘트가 제안하는 방향과 현재 코드의 트레이드오프 설명]

**선택지:**
- A: [코멘트대로 변경하는 경우 장단점]
- B: [현재 코드를 유지하는 경우 근거]

**판단 근거:** [관련 스킬 기준, 예: fe-tradeoffs 판단 기준 1(위험성)]

**답글 초안:**
> [결론 → 근거 → 대안 순서의 2~4문장]

---

## 🟢 조치 불필요

| 작성자 | 위치 | 내용 요약 | 사유 |
|--------|------|-----------|------|
| @user | `file.ts:10` | 좋은 패턴 칭찬 | 칭찬 |
| @user | `file.ts:25` | 변수명 질문 | 이미 답변됨 |

---

## 다음 단계

1. 🔴 항목부터 순서대로 수정
2. 🟡 항목은 답글 초안을 다듬어 리뷰어와 논의 후 결정
3. 수정 완료 후 re-review 요청
```

## 에러 처리

- **PR 없음:** "현재 브랜치에 열린 PR이 없습니다. 먼저 PR을 생성해주세요."
- **코멘트 없음:** "이 PR에 리뷰 코멘트가 없습니다. 리뷰를 요청해보세요."
- **GitHub CLI 미인증:** `gh auth login` 실행 안내
- **outdated 코멘트:** 코드가 이미 변경되어 라인이 맞지 않는 경우, 최선을 다해 현재 코드에서 해당 위치를 찾아 분석

## 중요 사항

- **현재 코드 기준 판단** - 코멘트가 달린 시점이 아닌, 현재 코드 상태를 기준으로 이미 해결되었는지 확인
- **맥락 파악** - 코멘트가 가리키는 파일을 반드시 `Read`로 읽어서 전체 맥락 안에서 판단
- **객관적 분류** - 개인 취향 vs 실제 문제를 구분. 근거가 약한 의견은 🟡로 분류
- **한국어 출력** - 최종 리포트는 한국어로
- **코드 변경은 하지 않음** - 분석과 제안만 제공, 실제 코드 수정은 사용자가 별도 요청 시 수행
- **답글은 초안만** - GitHub에 코멘트를 게시하거나 스레드를 resolve하지 않음
