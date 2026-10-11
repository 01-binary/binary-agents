# 결합도 (Coupling) 예시

`fe-coupling` 스킬의 항목별 상세 설명, Bad/Good 코드, 확인 질문(🔍)입니다.

### 1. 책임을 하나씩 관리하기

쿼리 파라미터, 상태, API 호출 같은 로직의 종류에 따라 함수나 컴포넌트, Hook을 나누지 않습니다. 로직 종류별로 묶으면 한 곳에서 다루는 맥락이 많아져 코드를 이해하고 수정하기 어려워집니다. 대신 책임(무엇을 관리하는가) 하나씩 나눕니다.

**Bad:**

```tsx
export function usePageState() {
  const [query, setQuery] = useQueryParams({
    cardId: NumberParam,
    statementId: NumberParam,
    dateFrom: DateParam,
    dateTo: DateParam,
    statusList: ArrayParam,
  });

  return useMemo(
    () => ({
      values: {
        cardId: query.cardId ?? undefined,
        statementId: query.statementId ?? undefined,
        dateFrom:
          query.dateFrom == null ? defaultDateFrom : moment(query.dateFrom),
        dateTo: query.dateTo == null ? defaultDateTo : moment(query.dateTo),
        statusList: query.statusList as StatementStatusType[] | undefined,
      },
      controls: {
        setCardId,
        setStatementId,
        setDateFrom,
        setDateTo,
        setStatusList,
      },
    }),
    [query, setQuery],
  );
}
```

**코드 냄새 — "광범위한 책임":** Hook이 페이지의 모든 쿼리 매개변수를 관리하므로 결합도가 높습니다. 페이지 내 여러 컴포넌트가 이 Hook에 의존하게 되며, 수정 시 영향 범위가 급격히 확장됩니다.

**Good:**

```tsx
export function useCardIdQueryParam() {
  const [cardId, _setCardId] = useQueryParam('cardId', NumberParam);

  const setCardId = useCallback((cardId: number) => {
    _setCardId({ cardId }, 'replaceIn');
  }, []);

  return [cardId ?? undefined, setCardId] as const;
}

function useDateRangeQueryParam() {
  /* 날짜 범위만 관리 */
}
function useStatusFilterQueryParam() {
  /* 상태 필터만 관리 */
}
```

**개선 효과:** 각 Hook이 단일 쿼리 파라미터만 관리합니다. 수정 시 영향 범위를 좁히고 예상하지 못한 부작용을 방지할 수 있습니다.

**🔍 검색:**

- 하나의 Hook이 5개 이상의 상태를 관리하는가?
- 새로운 기능이 추가되면 무조건 기존 Hook/컴포넌트에 추가되는 패턴인가?
- 수정 시 영향 범위를 예측하기 어려운 함수가 있는가?
- `useQueryParams`로 여러 파라미터를 한꺼번에 관리하고 있는가?

### 2. 중복 코드 허용하기

여러 페이지에서 반복되는 로직을 단일 Hook으로 통합하면 응집도는 높아지지만, 불필요한 결합도가 발생할 수 있습니다.

**Bad (과도한 공통화):**

```tsx
export const useOpenMaintenanceBottomSheet = () => {
  const maintenanceBottomSheet = useMaintenanceBottomSheet();
  const logger = useLogger();

  return async (maintainingInfo: TelecomMaintenanceInfo) => {
    logger.log('점검 바텀시트 열림');
    const result = await maintenanceBottomSheet.open(maintainingInfo);
    if (result) {
      logger.log('점검 바텀시트 알림받기 클릭');
    }
    closeView(); // 모든 페이지에서 화면 종료?
  };
};
```

**문제점:**

- 페이지마다 로깅 값이 다를 수 있음
- 어떤 페이지에서는 화면 종료가 불필요할 수 있음
- 바텀시트의 텍스트/이미지를 다르게 표시해야 할 수 있음
- Hook 수정 시 **모든 의존 페이지를 테스트해야 함** — 수정 범위가 확대

**Good:**

```tsx
// PageA.tsx - 자체 구현
const handleMaintenance = async () => {
  logger.log('page_a_maintenance_opened');
  await bottomSheet.open(info);
  closeView();
};

// PageB.tsx - 자체 구현 (다른 동작)
const handleMaintenance = async () => {
  logger.log('page_b_maintenance_opened');
  await bottomSheet.open(info);
  // 화면 종료 안 함
};
```

**When to ALLOW duplication (중복 허용):**

- 페이지마다 동작이 달라질 여지가 있을 때
- 기능이 실제로 동일한지 검증되지 않았을 때
- 2개 정도의 중복은 아직 추상화하기 이름

**When to EXTRACT (추상화가 적절한 경우):**
다음 조건을 **모두** 만족할 때만 공통화를 고려:

- 모든 페이지에서 로깅 값이 동일
- 바텀시트 동작이 완전히 동일
- 바텀시트의 UI가 동일
- **향후에도 이 상태가 유지될 예정**

즉, 3개 이상 **완전히 동일한** 로직이 반복되고, 함께 수정하지 않으면 **버그가 발생**하며, 핵심 비즈니스 로직의 **일관성이 필수**일 때만 추상화합니다.

> "함께 일하는 동료들과 적극적으로 소통하며 동작을 정확하게 이해해야" 공통화 여부를 판단할 수 있습니다.

**🔍 검색:**

- 공통 Hook/함수를 수정하면 의존하는 모든 페이지를 테스트해야 하는가?
- 페이지마다 실제로 동작이 동일한가, 미래에도 동일할 것인가?
- 공통화 전에 팀 간 합의와 요구사항 분석이 이루어졌는가?

### 3. Props Drilling 지우기

Props Drilling은 "부모와 자식 컴포넌트 사이의 결합도가 생겼다는 명확한 표시"입니다.

**Drilling의 구체적 피해:**

- prop 이름 변경 시 **모든 참조 컴포넌트를 수정**해야 함
- 불필요하게 prop을 참조하는 컴포넌트가 증가
- 코드 수정 범위가 필요 이상으로 넓어짐

**Bad:**

```tsx
function ItemEditModal({ items, recommendedItems, onConfirm }) {
  return (
    <ItemEditBody
      items={items}
      recommendedItems={recommendedItems}
      onConfirm={onConfirm}
    >
      <ItemEditList items={items} recommendedItems={recommendedItems} />
    </ItemEditBody>
  );
}
```

**Good (Option A - Composition 패턴):**

```tsx
function ItemEditModal({ items, recommendedItems, onConfirm }) {
  return (
    <ItemEditBody onConfirm={onConfirm}>
      <ItemEditList items={items} recommendedItems={recommendedItems} />
    </ItemEditBody>
  );
}

function ItemEditBody({ children, keyword, onKeywordChange, onClose }) {
  return (
    <>
      <Input
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
      />
      <Button onClick={onClose}>닫기</Button>
      {children}
    </>
  );
}
```

**Good (Option B - Context API):**

```tsx
const ItemEditContext = createContext<ItemEditContextValue>(null);

function ItemEditModal({ items, recommendedItems, onConfirm }) {
  return (
    <ItemEditContext.Provider value={{ items, recommendedItems, onConfirm }}>
      <ItemEditBody>
        <ItemEditList />
      </ItemEditBody>
    </ItemEditContext.Provider>
  );
}

function ItemEditList() {
  const { items, recommendedItems } = useItemEditModalContext();
}
```

**Decision criteria (단계별 접근):**

1. **Props의 의미 평가**: "Props는 의도를 표현한다" — 컴포넌트의 역할을 명확히 표현하는 props는 drilling이 아닐 수 있음
2. **Composition 패턴 우선**: Context 전에 먼저 `children`으로 depth 줄이기를 시도
3. **Context는 최후 수단**: 데이터를 사용하지 않는 단순 중간 컴포넌트가 있을 때 고려

**🔍 검색:**

- 중간 컴포넌트가 사용하지 않는 props를 단순 전달만 하는가?
- prop 이름 변경 시 수정해야 할 컴포넌트가 3개 이상인가?
- `children`을 활용한 composition으로 해결 가능한가?
- 개발자가 각 컴포넌트의 역할과 의도를 명확히 이해할 수 있는가?
