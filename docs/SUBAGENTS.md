# Claude 서브에이전트 모음 (Subagents Collection)

React/TypeScript 코드베이스 분석을 위한 Claude 서브에이전트 모음입니다.

## 📋 서브에이전트 개요

### 기본 버전 (Basic) vs 고급 버전 (Advanced)

| 특징 | 기본 버전 | 고급 버전 |
|------|----------|----------|
| **모델** | Haiku (빠름, 저렴) | Sonnet (강력, 심층 분석) |
| **도구** | Read, Glob, Grep | Read, Glob, Grep, WebFetch, WebSearch |
| **속도** | ⚡⚡⚡ 매우 빠름 | ⚡⚡ 빠름 |
| **비용** | 💰 저렴 | 💰💰 보통 |
| **분석 깊이** | 기본적인 패턴 인식 | 심층 추론 + 웹 리서치 |
| **권장사항** | 코드 기반 | 업계 표준 비교 + 학습 리소스 |
| **사용 시기** | 빠른 스캔, 일상적 검토 | 심층 분석, 아키텍처 리뷰 |

---

## 🔍 사용 가능한 서브에이전트

### 0. Subagent Builder (서브에이전트 빌더) 🛠️ **META**

#### [subagent-builder.md](subagent-builder.md) - 메타 에이전트 ⭐⭐⭐
```yaml
모델: sonnet
도구: Read, Glob, Grep, Write, Edit, WebFetch, WebSearch
설명: 서브에이전트를 생성, 수정, 커스터마이징하는 메타 에이전트
```

**주요 기능:**
- 🆕 새로운 서브에이전트 생성
- ✏️ 기존 서브에이전트 수정 및 커스터마이징
- 🎯 프로젝트별 특화 (React → Vue, Next.js 등)
- ⚙️ 모델/도구 최적화
- 📋 템플릿 제공 및 검증
- 🌐 도메인 베스트 프랙티스 리서치

**언제 사용하나요?**
- ✅ 새로운 분석 에이전트가 필요할 때
- ✅ 기존 에이전트를 특정 프레임워크에 맞추고 싶을 때
- ✅ 회사/팀 내부 규칙을 추가하고 싶을 때
- ✅ 서브에이전트 성능 최적화 (모델, 도구 선택)
- ✅ 여러 프로젝트에 맞는 에이전트 관리

**사용 예시:**
```bash
# 새로운 에이전트 생성
"subagent-builder를 사용해서 Vue 3 Composition API를
검사하는 에이전트 만들어줘"

# 기존 에이전트 커스터마이징
"code-reviewer를 Next.js 14 App Router에 특화되도록 수정해줘"

# 팀 규칙 추가
"junior-friendly-checker에 우리 회사 코딩 컨벤션을 추가해줘"

# 성능 최적화
"이 에이전트를 더 빠르게 만들 수 있을까?"
```

**출력물:**
- ✅ 새로운 `.md` 파일 생성
- ✅ 기존 파일 수정
- ✅ 설정 검증 및 최적화 제안
- ✅ 사용 가이드 및 예시

**📖 자세한 사용법은 [BUILDER_GUIDE.md](BUILDER_GUIDE.md)를 참고하세요!**

**실전 예시:**
- 🎯 Vue 3 전용 에이전트 만들기
- 🎯 팀 코딩 컨벤션 추가하기
- 🎯 보안 감사 에이전트 생성
- 🎯 성능 최적화
- 🎯 자동 수정 기능 추가

---

### 1. Toss Cohesion Analyzer (토스 응집도 분석기) 🆕 **SPECIAL**

#### [toss-cohesion-analyzer.md](../agents/toss-cohesion-analyzer.md) - Toss 원칙 특화 ⭐⭐⭐
```yaml
모델: haiku
도구: Read, Glob, Grep
설명: 토스 팀의 16가지 코드 품질 원칙을 기반으로 응집도, 결합도, 가독성 분석
```

**주요 기능:**
- 📁 도메인 기반 디렉토리 구조 분석
- 🔗 응집도(Cohesion)와 결합도(Coupling) 평가
- 📖 가독성 패턴 검증 (조건문 네이밍, 매직 넘버, 삼항 연산자)
- 🔄 실용적 중복 코드 판단 (때로는 중복이 더 나을 수 있다)
- 🎯 일관성 체크 (같은 이름 = 같은 동작, 같은 반환 타입)

**Toss 팀의 16가지 원칙:**
1. ✅ Code Directory Organization (도메인별 구성)
2. ✅ Condition Naming (조건문 네이밍)
3. ✅ Form Field Cohesion (필드 응집도)
4. ✅ Hidden Logic Exposure (숨은 로직 노출)
5. ✅ HTTP Naming Consistency (네이밍 일관성)
6. ✅ Props Drilling Solutions (컴포넌트 결합도)
7. ✅ Implementation Detail Abstraction (추상화)
8. ✅ Magic Numbers - Cohesion (매직 넘버와 응집도)
9. ✅ Magic Numbers - Readability (매직 넘버와 가독성)
10. ✅ Separating Non-Concurrent Code (비동시 코드 분리)
11. ✅ Ternary Operator Simplification (삼항 연산자)
12. ✅ Allowing Duplicate Code (중복 코드 허용 시점)
13. ✅ Page State Coupling (단일 책임)
14. ✅ Page State Readability (로직 분리)
15. ✅ Consistent Return Types (일관된 반환 타입)
16. ✅ Context Switching Minimization (컨텍스트 스위칭 최소화)

**평가 항목 (5개):**
- 📦 Code Organization & Cohesion (25%)
- 🔗 Coupling & Dependencies (25%)
- 📖 Readability Patterns (25%)
- ✅ Consistency Patterns (15%)
- 🔧 Practical Refactoring (10%)

**언제 사용하나요?**
- ✅ 토스 팀의 코드 품질 기준을 적용하고 싶을 때
- ✅ 응집도와 결합도를 명확히 구분해서 분석하고 싶을 때
- ✅ 실용적인 리팩토링 기준이 필요할 때
- ✅ 한국 핀테크 업계 표준을 따르고 싶을 때

**사용 예시:**
```bash
"toss-cohesion-analyzer로 이 프로젝트 분석해줘"
"토스 팀의 원칙에 맞게 코드를 개선하고 싶어"
```

**출력물:**
- 📊 Overall Score (100점 만점)
- ❌ Critical Issues (즉시 수정 필요)
- ⚠️ Recommended Improvements (권장 개선사항)
- ✅ Best Practices Found (잘하고 있는 부분)
- 📈 Toss Principles Summary (원칙별 준수 현황)

**Reference:**
- Source: [Toss Frontend Fundamentals](https://github.com/toss/frontend-fundamentals)

---

### 2. Code Quality Reviewers (코드 품질 리뷰어)

#### [code-reviewer.md](code-reviewer.md) - 기본 버전
```yaml
모델: haiku
도구: Read, Glob, Grep
설명: 함수형 프로그래밍, 클린 코드, 관심사 분리, 유지보수성 검토
```

**평가 항목 (5개):**
- ✅ 함수형 프로그래밍 원칙
- ✅ 관심사의 분리
- ✅ 코드 가독성
- ✅ React 특화 패턴
- ✅ TypeScript 사용

**언제 사용하나요?**
- 빠른 코드 품질 체크
- PR 리뷰 전 자동 검사
- 일상적인 코드 검토

---

#### [advanced-code-reviewer.md](advanced-code-reviewer.md) - 고급 버전 ⭐
```yaml
모델: sonnet
도구: Read, Glob, Grep, WebFetch, WebSearch
설명: 심층 아키텍처 분석 + 웹 기반 베스트 프랙티스 리서치
```

**평가 항목 (7개):**
- ✅ 함수형 프로그래밍 원칙
- ✅ **아키텍처 & 디자인 패턴** (신규)
- ✅ 관심사의 분리
- ✅ 코드 가독성
- ✅ React 특화 패턴
- ✅ TypeScript 사용
- ✅ **성능 & 최적화** (신규)

**웹 리서치 기능:**
- 🌐 최신 베스트 프랙티스 검색 (2025)
- 🌐 공식 문서 참조 (React, TypeScript 등)
- 🌐 업계 표준과 비교 분석
- 🌐 학습 리소스 제공

**언제 사용하나요?**
- 아키텍처 리뷰가 필요할 때
- 최신 패턴 적용 여부 확인
- 심층적인 품질 분석
- 팀 온보딩 전 코드베이스 평가

---

### 3. Refactoring Analyzers (리팩토링 분석기)

#### [refactor-analyzer.md](refactor-analyzer.md) - 기본 버전
```yaml
모델: haiku
도구: Read, Glob, Grep
설명: 코드 중복, 복잡도, 추상화 기회, 코드 스멜, 성능 문제 식별
```

**분석 영역 (5개):**
- 🔍 코드 중복
- 🔍 순환 복잡도 (Cyclomatic Complexity)
- 🔍 추상화 기회
- 🔍 코드 스멜
- 🔍 성능 기회

**언제 사용하나요?**
- 기술 부채 파악
- 리팩토링 우선순위 결정
- 코드 정리 작업 전

---

#### [advanced-refactor-analyzer.md](advanced-refactor-analyzer.md) - 고급 버전 ⭐
```yaml
모델: sonnet
도구: Read, Glob, Grep, WebFetch, WebSearch
설명: 심층 리팩토링 분석 + 업계 패턴 리서치 + 아키텍처 권장사항
```

**분석 영역 (6개):**
- 🔍 코드 중복
- 🔍 순환 복잡도
- 🔍 추상화 기회
- 🔍 코드 스멜
- 🔍 성능 기회
- 🔍 **아키텍처 부채** (신규)

**웹 리서치 기능:**
- 🌐 최신 리팩토링 패턴 검색
- 🌐 리팩토링 카탈로그 참조 (refactoring.guru 등)
- 🌐 마이그레이션 가이드 제공
- 🌐 업계 사례 연구
- 🌐 구체적인 코드 예제 제공

**추가 기능:**
- 📊 업계 벤치마크와 비교
- 📈 ROI(투자 대비 효과) 분석
- 🛣️ 단계별 마이그레이션 경로
- ⚠️ 리스크 평가 (낮음/중간/높음)

**언제 사용하나요?**
- 대규모 리팩토링 계획
- 아키텍처 현대화
- 레거시 코드 개선
- 최신 패턴 적용 검토

---

### 4. Junior Developer Readability Checkers (주니어 친화성 검사기)

#### [junior-friendly-checker.md](junior-friendly-checker.md) - 기본 버전
```yaml
모델: haiku
도구: Read, Glob, Grep
설명: 주니어 개발자 관점에서 네이밍, 복잡도, 주석, 구조, 타입 명확성 평가
```

**평가 항목 (5개):**
- 👤 네이밍 명확성 (25%)
- 👤 함수 복잡도 (20%)
- 👤 주석 품질 (25%)
- 👤 코드 구조 (15%)
- 👤 타입 명확성 (15%)

**특징:**
- 온보딩 시나리오 시뮬레이션
- 학습 곡선 예측
- 주니어 관점의 장벽 식별

**언제 사용하나요?**
- 팀에 주니어 합류 예정
- 코드 가독성 개선
- 온보딩 시간 단축 목표

---

#### [advanced-junior-checker.md](advanced-junior-checker.md) - 고급 버전 ⭐
```yaml
모델: sonnet
도구: Read, Glob, Grep, WebFetch, WebSearch
설명: 리서치 기반 권장사항 + 학습 리소스 큐레이션
```

**평가 항목 (6개):**
- 👤 네이밍 명확성 (25%)
- 👤 함수 복잡도 (20%)
- 👤 주석 품질 (25%)
- 👤 코드 구조 (15%)
- 👤 타입 명확성 (10%)
- 👤 **학습 곡선 평가** (5%, 신규)

**웹 리서치 기능:**
- 🌐 효과적인 온보딩 사례 연구
- 🌐 개념별 학습 리소스 큐레이션
- 🌐 공식 문서 + 튜토리얼 제공
- 🌐 업계 온보딩 베스트 프랙티스
- 🌐 단계별 학습 경로 제안

**추가 기능:**
- 📚 큐레이션된 학습 리소스
- 🎯 개념별 난이도 평가
- 📖 문서화 템플릿 제공
- 🗺️ 단계별 학습 경로

**언제 사용하나요?**
- 체계적인 온보딩 프로그램 구축
- 주니어 교육 자료 개발
- 코드베이스 접근성 극대화
- 팀 성장 계획 수립

---

## 🎯 어떤 버전을 선택해야 하나요?

### 기본 버전 (Haiku) 선택
- ✅ 빠른 피드백이 필요할 때
- ✅ 비용을 절감하고 싶을 때
- ✅ 일상적인 코드 검토
- ✅ 명확한 패턴 기반 분석
- ✅ CI/CD 파이프라인 자동화

### 고급 버전 (Sonnet) 선택
- ⭐ 아키텍처 리뷰가 필요할 때
- ⭐ 최신 베스트 프랙티스 확인
- ⭐ 학습 리소스가 필요할 때
- ⭐ 심층 분석 및 추론이 필요할 때
- ⭐ 팀 온보딩 자료 개발
- ⭐ 대규모 리팩토링 계획

---

## ❓ 어떻게 사용하나요?

### 🚨 중요: 자동 선택되지 않습니다!

Claude는 **명시적으로 요청**해야 해당 서브에이전트를 실행합니다.

### 사용 방법

#### 방법 1: 직접 지정 (명확함)
```bash
"code-reviewer를 사용해서 이 프로젝트 분석해줘"
→ code-reviewer.md 실행 (Haiku, 빠름)

"advanced-code-reviewer를 사용해서 최신 패턴과 비교해줘"
→ advanced-code-reviewer.md 실행 (Sonnet, 웹 리서치)
```

#### 방법 2: 상황 설명 (추천)
Claude가 요청 내용을 보고 적절한 에이전트 선택:

```bash
# 빠른 체크 → 기본 버전 선택
"빨리 코드 품질만 체크해줘"

# 심층 분석 → 고급 버전 선택
"최신 2025 React 베스트 프랙티스와 비교하고 학습 자료도 찾아줘"
```

### 워크플로우 예시

**단계 1: 빠른 스캔 (기본 버전)**
```
"code-reviewer로 주요 문제점 빠르게 찾아줘"
→ 5-10분, ~$0.05, 기본 이슈 15개 발견
```

**단계 2: 심층 분석 (필요시 고급 버전)**
```
"advanced-code-reviewer로 [발견된 이슈]에 대한
최신 해결 방법과 학습 자료 찾아줘"
→ 15-20분, ~$1.00, 상세 가이드 + 리소스
```

**📖 자세한 비교는 [COMPARISON.md](COMPARISON.md)를 참고하세요!**

---

## 💡 사용 예시

### 기본 리뷰 (빠른 체크)
```bash
# code-reviewer 사용
"이 프로젝트의 코드 품질을 빠르게 검토해줘"
→ 5-10분 내 기본 패턴 분석 완료
```

### 심층 분석 (아키텍처 리뷰)
```bash
# advanced-code-reviewer 사용
"이 프로젝트를 최신 React 베스트 프랙티스와 비교해줘"
→ 웹 리서치 포함 심층 분석 (15-20분)
→ 학습 리소스 + 업계 벤치마크 제공
```

### 리팩토링 계획
```bash
# refactor-analyzer 사용 (빠른 스캔)
"중복 코드와 복잡한 함수를 찾아줘"
→ 기본 메트릭스 제공

# advanced-refactor-analyzer 사용 (심층 계획)
"대규모 리팩토링을 위한 우선순위와 마이그레이션 경로를 제시해줘"
→ ROI 분석 + 단계별 가이드 + 웹 리소스
```

### 온보딩 준비
```bash
# junior-friendly-checker 사용
"주니어 개발자가 이해하기 어려운 부분을 찾아줘"
→ 기본 가독성 분석

# advanced-junior-checker 사용
"주니어 온보딩 프로그램을 위한 학습 자료와 개선 계획을 만들어줘"
→ 큐레이션된 학습 리소스 + 단계별 경로 + 문서화 가이드
```

---

## 🛠️ 도구 설명

### Read, Glob, Grep (모든 버전)
- **Read**: 파일 내용 읽기
- **Glob**: 파일 패턴 매칭 (`**/*.ts`, `**/*.tsx`)
- **Grep**: 정규식 기반 코드 검색

### WebFetch, WebSearch (고급 버전만)
- **WebFetch**: 특정 URL의 문서 가져오기
  - 예: React 공식 문서, TypeScript 핸드북
- **WebSearch**: 웹에서 베스트 프랙티스 검색
  - 예: "React hooks best practices 2025"

---

## 📊 성능 및 비용 비교

| 서브에이전트 | 평균 실행 시간 | 상대적 비용 | 웹 요청 수 |
|-------------|--------------|-----------|-----------|
| code-reviewer | 5-10분 | 💰 | 0 |
| **advanced-code-reviewer** | 15-20분 | 💰💰 | 5-7개 |
| refactor-analyzer | 5-10분 | 💰 | 0 |
| **advanced-refactor-analyzer** | 15-20분 | 💰💰 | 5-7개 |
| junior-friendly-checker | 5-10분 | 💰 | 0 |
| **advanced-junior-checker** | 15-20분 | 💰💰 | 5-7개 |

---

## 🎓 추가 정보

### 왜 읽기 전용 도구만 사용하나요?
- 🔒 **안전성**: 코드를 분석만 하고 수정하지 않음
- ✅ **예측 가능성**: 파일 시스템 변경 없음
- 🎯 **목적**: 분석 결과를 보고하고, 사람이 결정

### 웹 리서치는 어떻게 활용되나요?
- 📚 최신 베스트 프랙티스 확인
- 🔗 공식 문서 참조
- 💡 학습 리소스 제공
- 📊 업계 표준과 비교
- 🗺️ 마이그레이션 가이드

### 향후 확장 가능성
만약 자동 수정 기능이 필요하다면:
```yaml
# 미래 버전 예시
name: auto-refactorer
model: sonnet
tools: Read, Glob, Grep, Edit, Bash
description: 분석 + 자동 리팩토링 + 테스트 실행
```

---

## 📝 라이선스
이 서브에이전트들은 학습 및 팀 내 사용을 위해 제공됩니다.

---

## 🤝 기여
개선 제안이나 새로운 서브에이전트 아이디어가 있다면 이슈를 열어주세요!
