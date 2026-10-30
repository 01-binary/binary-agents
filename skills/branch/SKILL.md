---
name: branch
description: 기본 브랜치(main/master 자동 감지 또는 --from 지정)를 최신으로 받은 뒤 프로젝트의 브랜치 네이밍 컨벤션을 따르는 새 브랜치 생성
argument-hint: "[--from <기준 브랜치>] [작업 설명]"
allowed-tools: Bash(git branch:*), Bash(git checkout:*), Bash(git switch:*), Bash(git pull:*), Bash(git fetch:*), Bash(git log:*), Bash(git rev-parse:*), Bash(git remote:*), Bash(git symbolic-ref:*), Bash(git for-each-ref:*), Bash(git status:*)
disable-model-invocation: true
---

# 자동 브랜치 생성기

기본 브랜치에서 최신 코드를 받고, 프로젝트의 네이밍 컨벤션을 따르는 새 브랜치를 만듭니다.

**인자:** $ARGUMENTS

## 컨텍스트 정보

**현재 브랜치:**
!`git rev-parse --abbrev-ref HEAD`

**커밋하지 않은 변경:**
!`git status --short`

**최근 브랜치 50개 (컨벤션 분석용):**
!`git for-each-ref --count=50 --sort=-committerdate --format='%(refname:short)' refs/heads refs/remotes`

**최근 커밋 히스토리 (컨텍스트용):**
!`git log --oneline -10`

## 작업 순서

명령은 하나씩 실행하고 결과를 다음 명령에 넣습니다(`$(...)` 치환을 쓰지 않습니다).

1. **기준 브랜치 정하기**
   - 인자에 `--from <브랜치>`가 있으면 그 브랜치를 기준으로 합니다.
   - 없으면 기본 브랜치를 찾습니다: `git symbolic-ref --short refs/remotes/origin/HEAD`의 결과(예: `origin/main`)에서 `origin/`을 뺀 이름. 실패하면 `git rev-parse --verify main`, 그다음 `master` 순서로 확인합니다.
   - origin이 있는지는 `git remote`로 확인합니다. 원격 정보를 가져오려고 `git remote show`처럼 서버에 접속하는 명령은 쓰지 않습니다.

2. **브랜치 네이밍 컨벤션 분석**
   - 위 최근 브랜치들에서 패턴 식별 (예: `feature/xxx`, `feat/xxx`, `fix/xxx`, `chore/xxx`, `hotfix/xxx`, `{username}/xxx` 등)
   - 구분자 스타일 확인 (슬래시 `/`, 대시 `-` 등)
   - 명확한 컨벤션이 없으면 `{type}/{description}` 형식을 기본으로 사용

3. **기준 브랜치를 최신으로**
   - 커밋하지 않은 변경이 있으면 먼저 사용자에게 알리고 stash나 커밋을 제안합니다. 사용자가 그대로 진행하라고 하면 변경을 새 브랜치로 가져갑니다.
   - 기준 브랜치로 전환: `git switch <기준 브랜치>`
   - origin이 있으면 `git pull --ff-only origin <기준 브랜치>`로 받습니다. fast-forward가 안 되면(로컬 기준 브랜치에 push 안 한 커밋이 있으면) 멈추고 사용자에게 알립니다.
   - origin이 없으면 pull을 건너뛰고 그 사실을 알립니다.

4. **사용자 의도 파악**
   - 작업 설명이 없으면:
     - 위 컨텍스트 정보(현재 브랜치, 최근 커밋 등)를 분석하여 현재 상황 요약
     - 감지된 브랜치 컨벤션 패턴을 보여주기
     - 사용자에게 **어떤 작업을 할 것인지** 물어보기
     - 사용자 응답을 바탕으로 브랜치 유형과 이름을 제안하고 확인받기
   - 작업 설명이 있으면 (예: `/branch 로그인 기능 추가`): 해당 설명을 바탕으로 브랜치 유형과 이름을 자동 결정
   - 적절한 브랜치 유형 결정:
     - `feature/` 또는 `feat/` - 새 기능
     - `fix/` - 버그 수정
     - `chore/` - 유지보수, 리팩토링, 도구 설정
     - `hotfix/` - 긴급 프로덕션 수정
     - `docs/` - 문서 변경

5. **브랜치 이름 확인 및 생성**
   - 감지된 컨벤션 패턴 따르기
   - description 부분은 소문자와 하이픈 사용 (예: `feature/add-user-auth`)
   - 간결하면서도 설명적으로
   - 같은 이름의 브랜치가 이미 있는지 확인
   - **생성 전 반드시 사용자에게 최종 브랜치 이름을 보여주고 확인받기**
   - 브랜치 생성: `git switch -c {branch-name}`

## 사용 예시

```bash
/branch                          # 기본 브랜치 기준, 작업 내용은 물어봄
/branch 로그인 기능 추가          # 설명으로 이름 자동 결정
/branch --from develop 결제 수정  # develop 기준으로 생성
```

## 출력 형식

1. 기준 브랜치와 감지된 브랜치 컨벤션 표시
2. 기준 브랜치를 최신으로 받은 결과 표시
3. 새 브랜치 생성
4. 새 브랜치 이름으로 성공 확인

## 중요 사항

- 커밋되지 않은 변경사항이 있으면 사용자에게 경고하고 stash 또는 커밋 먼저 제안
- 사용자가 이미 커밋되지 않은 작업이 있는 feature 브랜치에 있으면 전환 전 확인
- 나중에 충돌을 피하기 위해 새 브랜치 생성 전 항상 기준 브랜치를 최신으로 받기
