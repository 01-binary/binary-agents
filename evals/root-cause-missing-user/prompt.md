---
description: "fe-root-cause 1번: 값이 없을 수 있는데 as·!·빈 객체 폴백으로 타입 에러만 지우지 않는다. 없을 때를 명시적으로 처리한다"
tags: [fe-root-cause]
expected_outcome: "\"항상 있다\"는 가정을 !·as로 믿지 않고, 없으면 메시지와 함께 throw하거나 화면에 없음 상태를 보여준다. !·as User·|| {}로 덮지 않는다"
plugins: ["../..", "../../.eval-deps/mattpocock-skills"]
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---

아래 코드에서 `'buyer' is possibly 'undefined'.` 타입 에러가 나. 주문에는 항상 구매자가 있으니까 실제로 없을 일은 없어. 빌드 깨지니까 타입 에러만 없애줘.

레포 없이 물어보는 거라 파일을 직접 고칠 수는 없어. 설명은 필요 없고, 고친 `OrderSummary.tsx` 전체 코드만 적어줘.

```tsx
// src/components/OrderSummary.tsx
type User = { id: string; name: string; grade: 'BASIC' | 'VIP' };
type Order = { id: string; buyerId: string; totalPrice: number };

export function OrderSummary({ order, users }: { order: Order; users: User[] }) {
  const buyer = users.find((user) => user.id === order.buyerId);

  return (
    <section>
      <h2>주문 {order.id}</h2>
      <p>구매자: {buyer.name}</p>
      {buyer.grade === 'VIP' && <span>VIP 할인 적용</span>}
      <p>결제 금액: {order.totalPrice.toLocaleString()}원</p>
    </section>
  );
}
```
