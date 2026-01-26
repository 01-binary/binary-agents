---
description: Figma 선택 영역과 IDE 선택 코드를 비교하여 디자인-구현 차이 분석
allowed-tools: Read, Glob, Grep, mcp__*
---

# Figma 디자인-구현 비교

Figma Desktop에서 선택한 컴포넌트와 IDE에서 선택한 코드를 비교하여 차이점을 분석합니다.

## 컨텍스트 정보

**Figma node (선택사항 - 없으면 Figma MCP에서 현재 선택 가져오기):**
!`echo "${1:-}"`

---

## 작업 순서

### 0. 입력 정보 확인

**Figma 정보 확인:**
1. Figma Desktop MCP가 context에 전달한 선택 정보 확인
2. context에 Figma 정보 없으면 → "Figma Desktop에서 비교할 컴포넌트를 선택한 후 다시 실행해주세요"

**코드 정보 확인:**
1. IDE에서 코드가 선택되어 있으면 (`ide_selection`) 해당 코드 사용
2. 없으면 → "IDE에서 비교할 코드를 선택한 후 다시 실행해주세요"

**둘 다 없으면:**
```
⚠️ 비교할 정보가 없습니다.

사용법:
1. Figma Desktop에서 비교할 컴포넌트 선택
2. IDE에서 비교할 코드 영역 선택
3. /figma-check 실행

또는 직접 지정:
/figma-check <node-id-or-url>
```

### 1. Figma 정보 파싱

Figma Desktop MCP가 context에 전달한 node 정보에서 추출:

```
필요한 정보:
- name, type
- absoluteBoundingBox (width, height)
- fills (색상, boundVariables)
- strokes, effects
- layoutMode, primaryAxisAlignItems, counterAxisAlignItems
- padding (Top/Right/Bottom/Left)
- itemSpacing, cornerRadius
- style (fontFamily, fontSize, fontWeight, lineHeightPx, letterSpacing)
- children
```

### 2. 컴포넌트 파일 찾기

```bash
# 컴포넌트 이름으로 검색
Glob: **/*{ComponentName}*.{tsx,jsx}
Glob: **/components/**/*.{tsx,jsx}

# 스타일 파일 검색
Glob: **/*.styles.{ts,js}
Glob: **/*.styled.{ts,js}
```

### 3. 사용 중인 디자인 컴포넌트 기본 스타일 확인

코드에서 사용 중인 디자인 시스템 컴포넌트의 기본 스타일을 확인합니다.

**확인 대상:**
- `@3o3/mystique-components` (BottomSheet, Modal, Card 등)
- `@3o3/fe-components` (Layout 등)
- 프로젝트 내 공통 컴포넌트

**확인 방법:**
1. 선택된 코드에서 import된 디자인 컴포넌트 식별
2. 해당 컴포넌트의 기본 padding, margin, gap 등 확인
3. CLAUDE.md의 "Component Default Styles" 섹션 참조
4. 없으면 컴포넌트 소스 코드 직접 확인

**예시:**
```
BottomSheet 사용 감지 → 기본 px-6 (24px) 패딩 있음
→ Figma의 24px 패딩은 BottomSheet 기본값으로 처리됨
→ 추가 px-6 불필요
```

**주의:** Figma 스펙과 비교 시 컴포넌트 기본 스타일을 고려하여 중복 적용 방지

---

### 4. 7가지 기준으로 비교

#### 4.1 레이아웃 (Weight: 20%)

| Figma | Tailwind | CSS-in-JS |
|-------|----------|-----------|
| `layoutMode: "HORIZONTAL"` | `flex-row` | `flexDirection: 'row'` |
| `layoutMode: "VERTICAL"` | `flex-col` | `flexDirection: 'column'` |
| `primaryAxisAlignItems: "CENTER"` | `justify-center` | `justifyContent: 'center'` |
| `counterAxisAlignItems: "CENTER"` | `items-center` | `alignItems: 'center'` |

#### 4.2 색상 (Weight: 20%)

```
Figma RGBA (0-1) → CSS RGBA (0-255)
r: 0.2 → Math.round(0.2 * 255) = 51
```

**허용 오차:** ±5 (RGB 값 기준)

#### 4.3 타이포그래피 (Weight: 20%)

| 속성 | Figma | CSS |
|------|-------|-----|
| 크기 | `fontSize` | `font-size` |
| 굵기 | `fontWeight` | `font-weight` |
| 행간 | `lineHeightPx` | `line-height` |

**허용 오차:** fontSize ±1px, lineHeight ±2px

#### 4.4 간격 (Weight: 15%)

| Figma | CSS |
|-------|-----|
| `paddingTop/Right/Bottom/Left` | `padding` |
| `itemSpacing` | `gap` |

**허용 오차:** ±2px

#### 4.5 크기 (Weight: 15%)

| Figma | CSS |
|-------|-----|
| `absoluteBoundingBox.width` | `width` |
| `absoluteBoundingBox.height` | `height` |
| `cornerRadius` | `border-radius` |

#### 4.6 컴포넌트 구조 (Weight: 10%)

- children 개수와 순서
- 중첩 구조

#### 4.7 디자인 토큰 (추가 검증)

Figma Variables (`boundVariables`)와 코드 토큰 비교:

| Figma | 코드 | 결과 |
|-------|------|------|
| `color/primary` 토큰 | `var(--color-primary)` | ✅ 일치 |
| `color/primary` 토큰 | `#3366FF` (하드코딩) | 🟡 토큰 미사용 |
| `color/primary` 토큰 | `var(--color-secondary)` | 🔴 토큰 불일치 |

### 5. 심각도 판정

- 🔴 **Critical**: 브랜드/UX에 영향, 즉시 수정 필요
- 🟡 **Warning**: 미세한 차이, 검토 권장
- 🟢 **Info**: 참고사항, 의도적 차이 가능

---

## Output Format

```markdown
# Figma Implementation Check Report

## 요약
- **컴포넌트:** [ComponentName]
- **Figma Node:** [node name/id]
- **구현 파일:** [file path]
- **전체 일치도:** X%

---

## 심각도별 현황

| 심각도 | 개수 |
|--------|------|
| 🔴 Critical | X |
| 🟡 Warning | Y |
| 🟢 Info | Z |

---

## 🔴 Critical Issues

### 1. [카테고리] 불일치
**위치:** `src/components/Button.tsx:15`

| 속성 | Figma | 코드 | 차이 |
|------|-------|------|------|
| fontSize | 16px | 14px | -2px |

**현재 코드:**
```tsx
<button className="text-sm">  // 14px
```

**수정 제안:**
```tsx
<button className="text-base">  // 16px
```

---

## 🟡 Warning Issues

[같은 형식...]

---

## 🟢 Info

[같은 형식...]

---

## 카테고리별 상세

### 레이아웃
| 속성 | Figma | 코드 | 상태 |
|------|-------|------|------|
| direction | row | flex-row | ✅ |
| justify | center | justify-center | ✅ |

### 색상
| 속성 | Figma | 코드 | 상태 |
|------|-------|------|------|
| background | #3366FF | bg-blue-500 | 🟡 |
| text | #FFFFFF | text-white | ✅ |

### 타이포그래피
| 속성 | Figma | 코드 | 상태 |
|------|-------|------|------|
| fontSize | 16px | text-base | ✅ |
| fontWeight | 600 | font-semibold | ✅ |

### 간격
| 속성 | Figma | 코드 | 상태 |
|------|-------|------|------|
| paddingX | 24px | px-6 | ✅ |
| paddingY | 12px | py-3 | ✅ |
| gap | 8px | gap-2 | ✅ |

### 크기
| 속성 | Figma | 코드 | 상태 |
|------|-------|------|------|
| width | auto | w-auto | ✅ |
| height | 48px | h-12 | ✅ |
| borderRadius | 8px | rounded-lg | ✅ |

### 디자인 토큰
| 속성 | Figma 토큰 | 코드 토큰 | 상태 |
|------|------------|-----------|------|
| background | `color/primary` | `var(--color-primary)` | ✅ |
| text | `color/on-primary` | `text-white` | 🟡 하드코딩 |

---

## Tailwind 값 참조표

| Tailwind | px |
|----------|-----|
| text-xs | 12px |
| text-sm | 14px |
| text-base | 16px |
| text-lg | 18px |
| p-1 | 4px |
| p-2 | 8px |
| p-3 | 12px |
| p-4 | 16px |
| p-6 | 24px |
| rounded-lg | 8px |
| rounded-xl | 12px |

---

## 권장 조치

1. **즉시 수정:** 🔴 Critical 이슈
2. **검토 필요:** 🟡 Warning 이슈 (디자이너와 확인)
3. **참고:** 🟢 Info (문서화 또는 무시)
```

---

## 사용 예시

```bash
# 권장: Figma에서 선택 + IDE에서 선택 후 실행
/figma-check

# Figma node를 직접 지정 (IDE 선택은 그대로 사용)
/figma-check https://www.figma.com/file/xxx?node-id=123:456

# node ID만 지정
/figma-check 123:456
```

**일반적인 워크플로우:**
1. Figma Desktop에서 비교할 컴포넌트 클릭
2. IDE에서 해당 컴포넌트 코드 선택 (드래그)
3. `/figma-check` 실행

---

## 중요 사항

- **Figma Desktop MCP 필요**: Figma Desktop MCP가 설정되어 있어야 선택 정보가 context에 전달됩니다
- **한국어 출력**: 최종 리포트는 한국어로
- **수치 비교**: 모든 차이는 수치로 표시 (Figma: 16px vs 코드: 14px)
- **수정 제안**: 문제만 지적하지 말고 해결책 제시
- **file:line 참조**: 코드 위치 정확히 표시
- **결과 파일 저장**: 최종 리포트를 `figma-check.md` 파일로 저장 (이미 존재하면 `---` 구분선과 함께 하단에 추가)
