---
description: 브랜치 차이, 커밋, 변경 파일을 분석하여 Pull Request 자동 생성
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(git rev-parse:*), Bash(gh pr:*), Bash(gh auth:*)
---

# 자동 PR 생성기

현재 브랜치와 main 브랜치의 차이를 분석하여 적절한 PR을 생성합니다.

## 컨텍스트 정보

**현재 브랜치:**
!`git rev-parse --abbrev-ref HEAD`

**Main 브랜치 (타겟):**
!`git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main"`

**이 브랜치의 커밋 (main에 없는):**
!`git log --oneline main..HEAD 2>/dev/null || git log --oneline origin/main..HEAD 2>/dev/null || echo "커밋을 찾을 수 없습니다"`

**변경 파일 요약:**
!`git diff --stat main..HEAD 2>/dev/null || git diff --stat origin/main..HEAD 2>/dev/null || echo "변경사항을 찾을 수 없습니다"`

**상세 변경사항:**
!`git diff main..HEAD --name-status 2>/dev/null || git diff origin/main..HEAD --name-status 2>/dev/null || echo "변경사항을 찾을 수 없습니다"`

**현재 git 상태:**
!`git status --short`

## 작업 순서

1. **브랜치 정보 분석**
   - 현재 브랜치 이름 확인
   - 타겟 브랜치 확인 (보통 main 또는 master)
   - push되지 않은 커밋이 있는지 확인

2. **커밋 분석**
   - PR에 포함될 모든 커밋 검토
   - 변경사항의 전체적인 목적 파악
   - feature, bugfix, refactor 등 유형 식별

3. **변경 파일 분석**
   - 어떤 파일이 수정/추가/삭제되었는가?
   - 코드베이스의 어느 영역이 영향받는가?
   - breaking changes가 있는가?

4. **PR 제목 및 설명 생성**
   - **제목**: 한국어로 간결한 요약 (커밋 컨벤션이 있으면 따르기)
   - **설명**: 다음 섹션 포함:
     - `## 변경 사항` (변경사항 요약)
     - `## 변경된 파일` (주요 변경 파일 목록)
     - `## 테스트` (해당되는 경우 테스트 방법)
   - **"Generated with Claude Code" 또는 AI attribution footer 추가 금지**

5. **PR 생성**
   - 먼저 브랜치가 remote에 push되었는지 확인
   - 생성된 title과 body로 `gh pr create` 사용
   - PR이 이미 존재하면 사용자에게 알림

## 출력 형식

먼저 간략히 설명:
- 현재 브랜치와 타겟 브랜치
- 포함될 커밋 수
- 변경사항 요약

그 다음 PR 생성 전 확인 요청, 제안된 title과 description 표시.

확인 후 실행:
```bash
gh pr create --title "title" --body "body"
```

## 에러 처리

- GitHub CLI 로그인 안됨: `gh auth login` 실행 안내
- 브랜치 미푸시: `git push -u origin <branch>`로 push 제안
- PR 이미 존재: 기존 PR URL 표시
- main 브랜치에서 실행: feature 브랜치 먼저 생성하라고 안내
