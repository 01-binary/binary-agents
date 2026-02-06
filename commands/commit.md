---
description: staged 변경사항과 최근 커밋을 분석하여 컨벤션에 맞는 커밋 메시지 자동 생성
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git commit:*)
---

# 자동 커밋 생성기

프로젝트의 커밋 컨벤션과 staged 변경사항을 분석하여 적절한 커밋 메시지를 생성합니다.

## 컨텍스트 정보

**최근 커밋 히스토리 (컨벤션 분석용):**
!`git log --oneline -20`

**Staged 변경사항 요약:**
!`git diff --cached --stat`

**Staged 변경사항 상세:**
!`git diff --cached`

**Unstaged 파일 (참고용):**
!`git status --short`

## 작업 순서

1. **커밋 컨벤션 분석**
   - 위 커밋 히스토리에서 패턴 식별 (예: `type: message`, `type(scope): message`, `[type] message`, 이모지 사용 등)
   - 사용 언어 확인 (한국어/영어 등)
   - 메시지 스타일 파악 (명령형, 과거형 등)

2. **Staged 변경사항 이해**
   - 어떤 파일이 수정/추가/삭제되었는가?
   - 이 변경들의 주요 목적은 무엇인가?
   - 별도 커밋으로 분리해야 할 여러 논리적 변경이 있는가?

3. **커밋 메시지 생성 및 확인**
   - 감지된 컨벤션 패턴 따르기 (type prefix, scope 등)
   - **한국어로 작성** (기존 히스토리가 영어여도)
   - **간결하게, 가능하면 1줄** (권장 50자, 최대 72자)
   - body는 정말 필요할 때만 추가
   - **Co-Authored-By footer 추가 금지**
   - **생성한 커밋 메시지를 사용자에게 보여주고 확인받기**
   - 사용자가 수정을 원하면 반영 후 다시 확인

4. **커밋 실행**
   - **사용자가 승인한 후에만** `git commit -m "message"` 실행
   - body가 필요하면 멀티라인 포맷 사용
   - **커밋 메시지에 Co-Authored-By 절대 포함 금지**

## 출력 형식

먼저 간략히 설명:
- 감지된 컨벤션 패턴
- 변경사항 요약

그 다음 커밋 메시지를 제안하고 사용자 확인 후 실행.

Staged 변경사항이 없으면 사용자에게 알리고 먼저 `git add` 사용을 제안.
