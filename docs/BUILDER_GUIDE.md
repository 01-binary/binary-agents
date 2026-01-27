# Subagent Builder 사용 가이드

`subagent-builder` 에이전트를 사용해 커스텀 서브에이전트를 만드는 방법입니다.

---

## Quick Start

### 1. 새 서브에이전트 만들기

```bash
"subagent-builder를 사용해서 접근성(accessibility)을 검사하는 에이전트를 만들어줘"
```

Builder가 자동으로:
1. 요구사항 확인 (어떤 프레임워크? 어떤 수준?)
2. 웹에서 베스트 프랙티스 검색
3. 평가 기준 설계
4. `accessibility-checker.md` 파일 생성

### 2. 기존 에이전트 수정

```bash
"code-reviewer를 Vue 3 Composition API에 맞게 수정해줘"
```

Builder가 자동으로:
1. 기존 `code-reviewer.md` 읽기
2. Vue 3 베스트 프랙티스 검색
3. React 패턴을 Vue 패턴으로 변경
4. `code-reviewer-vue3.md` 생성

### 3. 팀 규칙 추가

```bash
"junior-checker에 우리 회사 네이밍 규칙을 추가해줘:
- 컴포넌트는 PascalCase
- 훅은 use로 시작
- 상수는 UPPER_SNAKE_CASE"
```

---

## 실전 예시

### 기존 에이전트 목록

| 에이전트 | 용도 |
|----------|------|
| `code-reviewer` | 아키텍처, 타입, 에러 처리, 테스트, 접근성, 보안 |
| `refactor-analyzer` | 코드 중복, 복잡성, 추상화 기회 |
| `junior-checker` | 주니어 친화성 |
| `fundamentals-code` | Toss Frontend Fundamentals 기반 분석 |
| `react-performance-optimizer` | React 성능 최적화 |
| `react-principles-reviewer` | React 개발 원칙 (응집도/명시성, Props 관리, 네이밍, 부수효과) |
| `maintainable-code-reviewer` | 유지보수성 (UI-코드 1:1 대응, 분리의 4원칙) |

### 커스터마이징 예시

**프레임워크 특화:**
```bash
"code-reviewer를 Next.js 14 App Router에 맞게 수정해줘"
"fundamentals-code를 Vue 3에 맞게 적용해줘"
```

**도메인 특화:**
```bash
"code-reviewer에 금융 앱 보안 규칙 추가해줘"
"HIPAA 규정을 확인하는 에이전트 만들어줘"
```

**기능 추가:**
```bash
"refactor-analyzer에 자동 수정 기능 추가해줘"
"junior-checker를 웹 리서치 포함 버전으로 업그레이드해줘"
```

---

## 자주 쓰는 명령어

```bash
# 새 에이전트 생성
"subagent-builder로 [목적]을 검사하는 에이전트 만들어줘"

# 프레임워크 특화
"[에이전트]를 [프레임워크]에 맞게 수정해줘"

# 팀 규칙 추가
"[에이전트]에 우리 팀 규칙 추가해줘: [규칙들]"

# 기능 업그레이드
"[에이전트]에 웹 리서치/자동 수정 기능 추가해줘"

# 검증
"[에이전트] 설정이 올바른지 검증해줘"
```

---

## 문제 해결

### "에이전트가 원하는 걸 안 찾아요"
```bash
"[에이전트]에 [찾고 싶은 패턴]을 감지하는 기준 추가해줘"
```

### "여러 프로젝트에 같은 에이전트를 쓰고 싶어요"
```bash
"[기본 에이전트]를 [프로젝트명]에 맞게 복사하고 수정해줘"
```

### "에이전트 구조가 맞는지 모르겠어요"
```bash
"[에이전트] 파일이 올바른 포맷인지 검증해줘"
```

---

## 참고

상세한 서브에이전트 구조, 모델/도구 선택 가이드, 템플릿은 [subagent-builder.md](../agents/subagent-builder.md)를 참고하세요.
