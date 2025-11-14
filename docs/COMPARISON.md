# 기본 vs 고급 버전 상세 비교

## 📊 한눈에 보는 차이점

| 항목 | 기본 버전 (Basic) | 고급 버전 (Advanced) |
|------|------------------|---------------------|
| **모델** | Haiku | Sonnet |
| **토큰 비용** | ~$0.25 per 1M input | ~$3.00 per 1M input |
| **추론 능력** | 패턴 매칭, 규칙 기반 | 심층 추론, 컨텍스트 이해 |
| **도구** | Read, Glob, Grep | Read, Glob, Grep, WebFetch, WebSearch |
| **실행 시간** | 5-10분 | 15-20분 |
| **인터넷 접근** | ❌ 없음 | ✅ 있음 (최대 5-7회) |
| **분석 깊이** | 표면적 | 심층적 |
| **권장사항** | 코드 기반 | 코드 + 웹 리서치 기반 |
| **학습 리소스** | ❌ 제공 안함 | ✅ 큐레이션된 링크 제공 |
| **업계 비교** | ❌ 없음 | ✅ 2025 베스트 프랙티스 비교 |

---

## 🔍 1. Code Reviewer 비교

### code-reviewer.md (기본)

```yaml
name: code-reviewer
model: haiku
tools: Read, Glob, Grep
```

**평가 기준 (5개):**
1. 함수형 프로그래밍
2. 관심사의 분리
3. 코드 가독성
4. React 패턴
5. TypeScript

**출력 예시:**
```markdown
## 1. 함수형 프로그래밍 (7/10)

**Areas for Improvement:**
- src/utils/helper.ts:42 - Direct state mutation
- Recommended fix:
  ```typescript
  // 대신 spread operator 사용
  return { ...state, value: newValue }
  ```
```

**특징:**
- ✅ 빠른 분석 (5-10분)
- ✅ 명확한 안티패턴 감지
- ❌ 왜 문제인지 깊은 설명 부족
- ❌ 최신 패턴 여부 모름
- ❌ 학습 리소스 없음

---

### advanced-code-reviewer.md (고급)

```yaml
name: advanced-code-reviewer
model: sonnet
tools: Read, Glob, Grep, WebFetch, WebSearch
```

**평가 기준 (7개):**
1. 함수형 프로그래밍
2. **아키텍처 & 디자인 패턴** ⭐ 신규
3. 관심사의 분리
4. 코드 가독성
5. React 패턴
6. TypeScript
7. **성능 & 최적화** ⭐ 신규

**출력 예시:**
```markdown
## 1. 함수형 프로그래밍 (7/10)

**Areas for Improvement:**
- src/utils/helper.ts:42 - Direct state mutation
- **Industry Standard:** Immutable updates (React 권장사항)
- **Source:** WebFetch("https://react.dev/learn/updating-objects-in-state")
- **Why it matters:** React의 렌더링 최적화는 참조 비교에 의존하므로
  불변성이 성능에 직접적인 영향을 미칩니다.
- **Recommended fix:**
  ```typescript
  // 현대적 접근 (2025 React 베스트 프랙티스)
  // 1. 간단한 경우: spread operator
  return { ...state, value: newValue }

  // 2. 중첩된 경우: immer 라이브러리 사용
  import { produce } from 'immer'
  return produce(state, draft => {
    draft.nested.value = newValue
  })
  ```
- **Learning Resources:**
  - [React 공식 문서 - 불변성](https://react.dev/learn/updating-objects-in-state)
  - [Immer 사용 가이드](https://immerjs.github.io/immer/)

## 2. 아키텍처 & 디자인 패턴 (6/10) ⭐

**Current Pattern:** 컴포넌트 중심 구조 (Component-centric)
**Industry Standard:** Feature-based 모듈 구조 (2025 트렌드)

**Architectural Gaps:**
- 비즈니스 로직이 컴포넌트에 산재
- **Modern Approach:** Domain-Driven Design with hooks
- **Source:** WebSearch("React architecture patterns 2025")
- **Migration Path:**
  1. 비즈니스 로직을 custom hooks로 추출
  2. Feature별 폴더 구조로 재구성
  3. 도메인 모델 타입 정의
```

**특징:**
- ✅ 심층 분석 (15-20분)
- ✅ 최신 2025 패턴 확인
- ✅ 왜 문제인지 상세 설명
- ✅ 업계 표준과 비교
- ✅ 학습 리소스 링크 제공
- ✅ 마이그레이션 경로 제시
- ✅ 아키텍처 수준 평가

---

## 🔧 2. Refactor Analyzer 비교

### refactor-analyzer.md (기본)

```yaml
name: refactor-analyzer
model: haiku
tools: Read, Glob, Grep
```

**분석 영역 (5개):**
1. 코드 중복
2. 순환 복잡도
3. 추상화 기회
4. 코드 스멜
5. 성능 기회

**출력 예시:**
```markdown
## High Priority (Do First)

### 1. Duplicate Validation Logic
**Type:** Code Duplication
**Impact:** High | **Effort:** Low
**Files Affected:** 3 files

**Current State:**
- src/features/auth/Login.tsx:45-60
- src/features/signup/Register.tsx:52-67
- src/features/profile/EditProfile.tsx:88-103

**Problem:**
동일한 이메일 검증 로직이 3개 파일에 중복

**Recommended Solution:**
```typescript
// Create: src/utils/validation.ts
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
```

**Impact Metrics:**
- Lines removed: ~45 lines
- Maintenance burden: Reduced by 66%
```

**특징:**
- ✅ 빠른 중복 감지
- ✅ 메트릭스 제공
- ❌ 왜 이 패턴이 좋은지 설명 없음
- ❌ 다른 해결 방법 비교 없음
- ❌ 업계 표준 모름

---

### advanced-refactor-analyzer.md (고급)

```yaml
name: advanced-refactor-analyzer
model: sonnet
tools: Read, Glob, Grep, WebFetch, WebSearch
```

**분석 영역 (6개):**
1. 코드 중복
2. 순환 복잡도
3. 추상화 기회
4. 코드 스멜
5. 성능 기회
6. **아키텍처 부채** ⭐ 신규

**출력 예시:**
```markdown
## High Priority (Do First)

### 1. Duplicate Validation Logic
**Type:** Code Duplication
**Impact:** High | **Effort:** Low | **ROI:** ⭐⭐⭐⭐⭐
**Files Affected:** 3 files

**Current State:**
- src/features/auth/Login.tsx:45-60
- src/features/signup/Register.tsx:52-67
- src/features/profile/EditProfile.tsx:88-103

**Problem:**
동일한 이메일 검증 로직이 3개 파일에 중복

**Industry Standard:**
현대적인 폼 검증은 선언적 스키마 기반 접근 (2025 트렌드)
**Source:** WebSearch("React form validation best practices 2025")

**Recommended Solutions (3가지 접근):**

#### 옵션 1: 간단한 유틸 함수 (현재 패턴 유지)
```typescript
// Create: src/utils/validation.ts
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
```
**장점:** 빠른 적용, 최소 변경
**단점:** 복잡한 검증 로직에 확장성 낮음

#### 옵션 2: 스키마 기반 검증 (추천) ⭐
```typescript
// Using Zod (2025 React 커뮤니티 표준)
// Source: https://zod.dev
import { z } from 'zod'

export const emailSchema = z.string().email()
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8)
})

// Usage in component
const { errors } = loginSchema.safeParse(formData)
```
**장점:** 타입 안전성, 확장 가능, 재사용성 높음
**단점:** 새로운 라이브러리 도입

#### 옵션 3: React Hook Form + Zod (최신 패턴)
```typescript
// Industry standard for 2025
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const { register, handleSubmit } = useForm({
  resolver: zodResolver(loginSchema)
})
```
**장점:** 성능 최적화 (uncontrolled), 선언적, 타입 안전
**단점:** 가장 큰 변경 필요

**Migration Path (추천: 옵션 2):**
1. Week 1: Zod 설치 및 스키마 정의
   - `npm install zod`
   - 공통 스키마 작성 (email, password 등)
2. Week 2: 한 페이지씩 마이그레이션
   - Login 페이지 먼저 적용
   - 테스트 후 다른 페이지 적용
3. Week 3: 레거시 검증 로직 제거

**Impact Metrics:**
- Lines removed: ~45 lines
- Maintenance burden: Reduced by 66%
- Type safety: Improved (TypeScript inference)
- Validation errors: Reduced by ~40% (업계 통계)

**Learning Resources:**
- [Zod 공식 문서](https://zod.dev)
- [React Hook Form Guide](https://react-hook-form.com)
- [Form Validation 2025 패턴 비교](https://example.com)

**ROI Analysis:**
- 초기 투자: 2-3 days
- 장기 절감: 20+ hours/year (유지보수)
- 버그 감소: ~40% (타입 안전성)

---

## Industry Trends You're Missing

Based on 2025 best practices:
1. **Schema-based Validation**
   - **Adoption:** 70%+ of React projects
   - **Why it matters:** 타입 안전성 + 런타임 검증 통합
   - **Learn more:** [Link to trend analysis]
```

**특징:**
- ✅ 심층 분석 + 여러 해결책 비교
- ✅ 최신 2025 트렌드 반영
- ✅ ROI(투자 대비 효과) 분석
- ✅ 단계별 마이그레이션 가이드
- ✅ 학습 리소스 큐레이션
- ✅ 업계 채택률 통계
- ✅ 리스크 평가

---

## 👤 3. Junior Checker 비교

### junior-friendly-checker.md (기본)

```yaml
name: junior-friendly-checker
model: haiku
tools: Read, Glob, Grep
```

**평가 항목 (5개):**
1. 네이밍 명확성 (25%)
2. 함수 복잡도 (20%)
3. 주석 품질 (25%)
4. 코드 구조 (15%)
5. 타입 명확성 (15%)

**출력 예시:**
```markdown
## 2. 함수 복잡도: 6/10

### Complexity Hotspots
| File:Line | Function | Lines | Nesting | Junior-Friendly? |
|-----------|----------|-------|---------|------------------|
| src/utils/calc.ts:42 | processData | 65 | 4 | ❌ Too complex |

### Refactoring Suggestions
1. **src/utils/calc.ts:42 - processData**
   - Current: 65 lines, 4 nesting levels
   - Suggestion: Extract helper functions
   - Benefit: Junior can understand each piece independently
```

**특징:**
- ✅ 복잡도 측정
- ✅ 주니어 관점 피드백
- ❌ 구체적인 학습 방법 없음
- ❌ 어떤 개념을 공부해야 하는지 모름

---

### advanced-junior-checker.md (고급)

```yaml
name: advanced-junior-checker
model: sonnet
tools: Read, Glob, Grep, WebFetch, WebSearch
```

**평가 항목 (6개):**
1. 네이밍 명확성 (25%)
2. 함수 복잡도 (20%)
3. 주석 품질 (25%)
4. 코드 구조 (15%)
5. 타입 명확성 (10%)
6. **학습 곡선 평가** (5%) ⭐ 신규

**출력 예시:**
```markdown
## 2. 함수 복잡도: 6/10

### Complexity Hotspots
| File:Line | Function | Lines | Nesting | Cognitive | Junior-Friendly? |
|-----------|----------|-------|---------|-----------|------------------|
| src/utils/calc.ts:42 | processData | 65 | 4 | High | ❌ Too complex |

### Refactoring Suggestions for Junior Readability

#### 1. **src/utils/calc.ts:42 - processData**
**Current State:**
- 65 lines, 4 nesting levels, high cognitive complexity
- **Junior impact:** 주니어가 이해하는데 30-45분 소요 예상

**Why it's confusing for juniors:**
- 중첩된 조건문 4단계 (if 안의 if 안의 if...)
- 8개의 로컬 변수 동시에 추적 필요
- 변수명이 축약형 (data, temp, res)
- 주석 없는 복잡한 계산식

**Simplified Approach:**
```typescript
// Before: 65줄의 복잡한 함수 (주니어 혼란)
function processData(data, config) {
  let res = []
  if (config.type === 'A') {
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].valid) {
          // ... 30 more lines
        }
      }
    }
  }
  // ... 35 more lines
  return res
}

// After: 명확한 단계별 함수 (주니어 친화적)
/**
 * 데이터를 처리하여 결과 배열을 반환합니다.
 *
 * 처리 단계:
 * 1. 유효성 검사
 * 2. 타입별 필터링
 * 3. 변환 및 포맷팅
 */
function processData(data: DataItem[], config: ProcessConfig): ProcessedResult[] {
  // Step 1: Early return으로 복잡도 감소
  if (!isValidConfig(config)) {
    return []
  }

  // Step 2: 각 단계를 명확한 이름의 함수로 분리
  const validItems = filterValidItems(data)
  const filteredByType = filterByType(validItems, config.type)
  const processedResults = transformItems(filteredByType)

  return processedResults
}

// 각 헬퍼 함수는 10줄 이하, 한 가지 일만 수행
function filterValidItems(data: DataItem[]): DataItem[] {
  return data.filter(item => item.valid)
}

function filterByType(items: DataItem[], type: string): DataItem[] {
  return items.filter(item => item.type === type)
}

function transformItems(items: DataItem[]): ProcessedResult[] {
  return items.map(item => ({
    id: item.id,
    value: calculateValue(item)
  }))
}
```

**Benefits for Juniors:**
- ✅ 각 함수는 10줄 이하 (한눈에 이해 가능)
- ✅ 함수 이름이 곧 주석 (self-documenting)
- ✅ 중첩 깊이 1단계로 감소
- ✅ 단계별 디버깅 가능
- ✅ 각 함수를 독립적으로 테스트 가능
- ✅ 비슷한 패턴 반복으로 학습 효과

**Learning Resources:**
- [Clean Code 함수 작성법](https://example.com) - 함수를 작게 만드는 이유
- [Cognitive Complexity 이해하기](https://example.com) - 왜 중첩을 피해야 하는가
- [Early Return 패턴](https://example.com) - Guard clauses 활용법

**Estimated Learning Time:**
- 현재 함수 이해: 30-45분
- 리팩토링 후 이해: 5-10분 ⏱️ 70% 단축!

---

## 6. 학습 곡선: 7/10 ⭐

### Concepts Juniors Need to Learn
| Concept | Difficulty | Used In | Priority | Learning Resource |
|---------|-----------|---------|----------|-------------------|
| Array methods (map/filter) | Easy | 12 files | High | [MDN Array Methods](https://example.com) |
| Custom Hooks | Medium | 8 files | High | [React Hooks Guide](https://react.dev/learn) |
| TypeScript Generics | Hard | 5 files | Medium | [TS Handbook - Generics](https://example.com) |
| Context API | Medium | 3 files | Medium | [React Context Tutorial](https://example.com) |

### Curated Learning Path

**Week 1: JavaScript/TypeScript 기초 강화**
- [ ] Array methods 마스터 (필수!)
  - Tutorial: [JavaScript Array Methods](https://example.com)
  - Practice: [Exercises](https://example.com)
  - 코드베이스에서 연습할 파일: src/utils/array.ts

**Week 2: React 기본 패턴**
- [ ] Component composition
  - Guide: [Thinking in React](https://react.dev)
  - 코드베이스 예시: src/components/Layout.tsx

**Week 3: Custom Hooks (핵심!)**
- [ ] Custom hooks 이해
  - Why: 코드베이스에서 가장 많이 사용 (8개 파일)
  - Tutorial: [Building Your Own Hooks](https://react.dev)
  - 코드베이스에서 시작할 파일: src/hooks/useAuth.ts (가장 간단)

**Week 4: TypeScript 심화**
- [ ] Generics 이해
  - 코드베이스 예시: src/types/api.ts
  - Interactive tutorial: [TypeScript Playground](https://example.com)

### Onboarding Documentation to Create

**Missing Documentation (주니어에게 필수!):**
1. **아키텍처 가이드** (HIGH PRIORITY)
   - 어떤 파일이 어떤 역할?
   - 새 기능 추가시 어디에 코드 작성?
   - Template: [Architecture Guide](https://example.com)

2. **Common Patterns 예시**
   - 코드베이스에서 반복되는 패턴 설명
   - 복사해서 쓸 수 있는 템플릿
   - Example: [Pattern Library](https://example.com)

3. **ONBOARDING.md 생성**
```markdown
# 주니어 개발자 온보딩 가이드

## Day 1: 환경 설정 및 첫 실행
- 코드 클론 및 의존성 설치
- 로컬 실행 확인
- 코드베이스 구조 훑어보기

## Week 1: 기본 개념 학습
- [학습 리소스 링크]
- 간단한 버그 수정 (good first issue)

## Week 2-4: 점진적 기능 추가
- [단계별 가이드]
```

**Industry Comparison:**
- Your codebase: 온보딩 시간 ~3-4주
- Industry average: ~2-3주
- Best in class: ~1주
- **Gap:** 문서화 부족 + 복잡한 함수

**Source:** WebSearch("developer onboarding best practices 2025")
```

**특징:**
- ✅ 구체적인 학습 로드맵
- ✅ 난이도별 개념 분류
- ✅ 큐레이션된 학습 리소스
- ✅ 코드베이스 특화 가이드
- ✅ 단계별 온보딩 계획
- ✅ 업계 평균과 비교
- ✅ 시간 절감 효과 측정

---

## 🤔 사용 방법: 자동으로 선택되나요?

### ❌ 자동 선택 안됨!

Claude는 **파일 이름**으로 서브에이전트를 선택합니다.
따라서 **명시적으로 요청**해야 합니다.

### ✅ 사용 방법

#### 1. 기본 버전 사용하기
```
"code-reviewer를 사용해서 이 프로젝트 분석해줘"
```
→ `code-reviewer.md`가 실행됨 (Haiku, 빠름)

#### 2. 고급 버전 사용하기
```
"advanced-code-reviewer를 사용해서 최신 베스트 프랙티스와 비교해줘"
```
→ `advanced-code-reviewer.md`가 실행됨 (Sonnet, 웹 리서치)

#### 3. 암묵적 사용 (추천!)
상황에 맞게 요청하면 Claude가 적절한 에이전트 선택:

**빠른 체크가 필요한 경우:**
```
"빨리 코드 품질만 체크해줘"
```
→ Claude가 `code-reviewer` 선택 (Haiku)

**심층 분석이 필요한 경우:**
```
"이 프로젝트가 2025년 React 베스트 프랙티스를 따르는지
최신 문서와 비교해서 분석하고, 부족한 부분에 대한
학습 자료도 찾아줘"
```
→ Claude가 `advanced-code-reviewer` 선택 (Sonnet + 웹)

---

## 💡 실전 사용 시나리오

### 시나리오 1: 일상적인 PR 리뷰
```
User: "이 PR 코드 품질 빠르게 체크해줘"
Claude: [code-reviewer 사용]
→ 5분 내 결과
→ 기본 안티패턴 감지
→ 비용 저렴
```

### 시나리오 2: 새 프로젝트 아키텍처 리뷰
```
User: "이 프로젝트의 아키텍처를 최신 React 패턴과 비교하고,
      개선 방향을 제시해줘. 학습 자료도 같이 찾아줘"
Claude: [advanced-code-reviewer 사용]
→ 15-20분 분석
→ 웹에서 2025 베스트 프랙티스 검색
→ 업계 표준과 비교
→ 학습 리소스 큐레이션
→ 상세한 마이그레이션 가이드
```

### 시나리오 3: 리팩토링 계획
```
User: "중복 코드 찾아줘"
Claude: [refactor-analyzer 사용]
→ 빠른 중복 감지

User: "이 중복을 해결하는 최신 패턴이 뭐야?
      여러 방법 비교해줘"
Claude: [advanced-refactor-analyzer 사용]
→ 웹에서 최신 패턴 검색
→ 3-4가지 해결 방법 비교
→ ROI 분석
→ 단계별 마이그레이션 가이드
```

### 시나리오 4: 주니어 온보딩 준비
```
User: "주니어가 이 코드 이해하기 어려운 부분 찾아줘"
Claude: [junior-friendly-checker 사용]
→ 기본 가독성 분석

User: "주니어를 위한 학습 자료랑 온보딩 가이드 만들어줘"
Claude: [advanced-junior-checker 사용]
→ 코드베이스 특화 학습 경로
→ 큐레이션된 튜토리얼
→ 단계별 온보딩 계획
→ ONBOARDING.md 템플릿
```

---

## 🎯 언제 어떤 버전을 사용할까?

### 기본 버전 (Haiku) 사용
✅ **이럴 때 사용:**
- 빠른 피드백 필요
- 명확한 안티패턴만 찾으면 됨
- 비용 절감이 중요
- CI/CD 자동화
- 이미 패턴을 알고 있고 확인만 필요

❌ **이럴 땐 부족:**
- 최신 패턴 모를 때
- 여러 해결책 비교 필요
- 학습 자료 필요
- 업계 표준 궁금
- 왜 문제인지 깊은 이해 필요

### 고급 버전 (Sonnet) 사용
✅ **이럴 때 사용:**
- 아키텍처 리뷰
- 최신 2025 패턴 확인
- 여러 해결책 비교
- 학습 리소스 필요
- 팀 온보딩 자료 개발
- 대규모 리팩토링 계획
- 업계 벤치마크 필요
- 왜 문제인지 깊은 이해 필요

❌ **이럴 땐 과함:**
- 단순 안티패턴 체크
- 빠른 피드백만 필요
- 이미 해결책 알고 있음
- 비용 최소화가 목표

---

## 📊 비용 효율성 분석

### 예시: 중간 규모 프로젝트 (100개 파일)

#### 기본 버전
- **실행 시간:** 7분
- **토큰 사용:** ~50K tokens
- **예상 비용:** ~$0.0125 (input) + $0.0375 (output) = **~$0.05**
- **웹 요청:** 0회
- **결과:** 기본 안티패턴 15개 발견

#### 고급 버전
- **실행 시간:** 18분
- **토큰 사용:** ~80K tokens (웹 리서치 포함)
- **예상 비용:** ~$0.24 (input) + $$0.72 (output) = **~$0.96**
- **웹 요청:** 6회
- **결과:**
  - 안티패턴 15개 + 상세 설명
  - 최신 패턴 비교 5개
  - 학습 리소스 20개
  - 마이그레이션 가이드 3개

#### ROI 계산
- **기본:** 문제 찾기만 → 해결책 직접 검색 필요 (1-2시간)
- **고급:** 문제 + 해결책 + 학습 자료 모두 제공 (0시간)
- **시간 절약:** 1-2시간 × 개발자 시급 = **훨씬 큰 가치**

---

## 🚀 추천 워크플로우

### 단계 1: 빠른 스캔 (기본 버전)
```bash
"code-reviewer로 문제점 빠르게 찾아줘"
```
→ 5-10분, 저렴, 주요 이슈 파악

### 단계 2: 심층 분석 (고급 버전)
심각한 이슈 발견 시:
```bash
"advanced-code-reviewer로 [발견된 이슈]를
최신 패턴과 비교하고 해결 방법 찾아줘"
```
→ 15-20분, 웹 리서치, 상세 가이드

### 단계 3: 실행
제공된 마이그레이션 가이드 따라 리팩토링

---

## 📝 요약

| 질문 | 답변 |
|------|------|
| **자동으로 선택되나요?** | ❌ 아니요, 명시적으로 요청해야 함 |
| **어떻게 선택하나요?** | 파일 이름으로 (`code-reviewer` vs `advanced-code-reviewer`) |
| **기본은 언제?** | 빠른 체크, 비용 절감, 명확한 패턴 감지 |
| **고급은 언제?** | 심층 분석, 최신 패턴, 학습 리소스, 아키텍처 리뷰 |
| **비용 차이는?** | 기본: ~$0.05, 고급: ~$1.00 (20배 차이) |
| **시간 차이는?** | 기본: 5-10분, 고급: 15-20분 (2-3배 차이) |
| **가치 차이는?** | 고급이 1-2시간 검색 시간 절약 → ROI 훨씬 높음 |

**결론:** 상황에 맞게 선택하되, 중요한 결정에는 고급 버전이 시간과 비용 모두 절약!
