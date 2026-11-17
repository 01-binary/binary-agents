---
description: "fe-react 부수효과 위치: 여러 화면이 쓰는 mutation 훅 안에 토스트·페이지 이동을 고정하지 않는다. 호출하는 쪽에 둔다"
tags: [fe-react]
expected_outcome: "useCancelOrder는 API 호출과 캐시 무효화만 하고, 토스트와 /orders 이동은 상세 페이지의 호출부(mutate의 onSuccess 등)에 둔다"
plugins: ["../..", "../../.eval-deps/mattpocock-skills"]
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---

TanStack Query v5랑 react-router를 쓰고 있어. 주문 취소 API `cancelOrder(orderId)`를 부르는 `useCancelOrder` 훅을 만들어줘. 이 훅은 주문 상세 페이지랑 주문 목록 페이지 두 곳에서 쓸 거야.

주문 상세 페이지에서는 취소되면 `toast('주문이 취소됐어요')`를 띄우고 주문 목록(`/orders`)으로 이동해야 해. 취소 후에는 주문 목록 쿼리(`['orders']`)가 새로 불러와져야 하고.

레포 없이 물어보는 거라 파일을 직접 고칠 수는 없어. 설명은 필요 없고, `useCancelOrder.ts`와 그 훅을 쓰는 `OrderDetailPage.tsx`의 취소 버튼 부분 코드만 적어줘.

```tsx
// src/api/orders.ts
export async function cancelOrder(orderId: string): Promise<void> { /* ... */ }

// src/lib/toast.ts
export function toast(message: string): void { /* ... */ }

// src/pages/OrderDetailPage.tsx (일부)
export function OrderDetailPage({ orderId }: { orderId: string }) {
  return (
    <main>
      {/* ...주문 정보... */}
      <button type="button">주문 취소</button>
    </main>
  );
}
```
