---
description: main에서 pull 후 프로젝트의 브랜치 네이밍 컨벤션을 따르는 새 브랜치 생성
allowed-tools: Bash(git branch:*), Bash(git checkout:*), Bash(git switch:*), Bash(git pull:*), Bash(git fetch:*), Bash(git log:*), Bash(git rev-parse:*), Bash(git remote:*)
---

# 자동 브랜치 생성기

main에서 최신 코드를 pull하고 프로젝트의 네이밍 컨벤션을 따르는 새 브랜치를 생성합니다.

## 컨텍스트 정보

**현재 브랜치:**
!`git rev-parse --abbrev-ref HEAD`

**모든 브랜치 (컨벤션 분석용):**
!`git branch -a --sort=-committerdate`

**최근 커밋 히스토리 (컨텍스트용):**
!`git log --oneline -10`

**Remote 정보 (main 브랜치 감지용):**
!`git remote show origin`

## 작업 순서

1. **브랜치 네이밍 컨벤션 분석**
   - 위 기존 브랜치들에서 패턴 식별 (예: `feature/xxx`, `feat/xxx`, `fix/xxx`, `chore/xxx`, `hotfix/xxx`, `{username}/xxx` 등)
   - 구분자 스타일 확인 (슬래시 `/`, 대시 `-` 등)
   - 명확한 컨벤션이 없으면 `{type}/{description}` 형식을 기본으로 사용

2. **main에서 최신 코드 pull**
   - main 브랜치로 전환: `git checkout main` 또는 `git switch main`
   - 최신 변경사항 pull: `git pull origin main`
   - 커밋되지 않은 변경사항이 있으면 먼저 사용자에게 경고

3. **사용자 의도 파악**
   - `/branch` 뒤에 추가 인자가 없으면:
     - 위 컨텍스트 정보(현재 브랜치, 최근 커밋 등)를 분석하여 현재 상황 요약
     - 감지된 브랜치 컨벤션 패턴을 보여주기
     - 사용자에게 **어떤 작업을 할 것인지** 물어보기 (예: "어떤 작업을 위한 브랜치를 만드시겠습니까?")
     - 사용자 응답을 바탕으로 브랜치 유형과 이름을 제안하고 확인받기
   - `/branch` 뒤에 설명이 있으면 (예: `/branch 로그인 기능 추가`):
     - 해당 설명을 바탕으로 브랜치 유형과 이름을 자동 결정
   - 적절한 브랜치 유형 결정:
     - `feature/` 또는 `feat/` - 새 기능
     - `fix/` - 버그 수정
     - `chore/` - 유지보수, 리팩토링, 도구 설정
     - `hotfix/` - 긴급 프로덕션 수정
     - `docs/` - 문서 변경

4. **브랜치 이름 확인 및 생성**
   - 감지된 컨벤션 패턴 따르기
   - description 부분은 소문자와 하이픈 사용 (예: `feature/add-user-auth`)
   - 간결하면서도 설명적으로
   - **생성 전 반드시 사용자에게 최종 브랜치 이름을 보여주고 확인받기**
   - 브랜치 생성: `git checkout -b {branch-name}` 또는 `git switch -c {branch-name}`

## 출력 형식

1. 감지된 브랜치 컨벤션 표시 (있는 경우)
2. main에서 pull하고 결과 표시
3. 새 브랜치 생성
4. 새 브랜치 이름으로 성공 확인

## 중요 사항

- 커밋되지 않은 변경사항이 있으면 사용자에게 경고하고 stash 또는 커밋 먼저 제안
- 사용자가 이미 커밋되지 않은 작업이 있는 feature 브랜치에 있으면 전환 전 확인
- 나중에 충돌을 피하기 위해 새 브랜치 생성 전 항상 최신 main pull
