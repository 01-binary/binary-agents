---
description: "fe-state 반대 케이스: 한 페이지에서만 쓰는 모달 열림 여부는 로컬 상태로 충분하다. 전역 스토어·Context로 올리면 안 된다"
tags: [fe-state, negative]
expected_outcome: "모달 열림 여부를 CartPage 안의 useState로 두고, 이미 있는 cartStore에는 손대지 않는다"
plugins: ["../..", "../../.eval-deps/mattpocock-skills"]
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---

아래 장바구니 페이지에 '쿠폰 입력' 버튼을 추가해줘. 누르면 쿠폰 입력 모달이 열리고, 모달에서 닫으면 닫혀야 해. 모달은 `<CouponModal onClose={...} />`로 이미 만들어져 있어.

레포 없이 물어보는 거라 파일을 직접 고칠 수는 없어. 고친 코드 전체를 답변에 적어줘.

```tsx
// src/pages/CartPage.tsx
import { useCartStore } from '../stores/cartStore';
import { CartItemList } from '../components/CartItemList';
import { CouponModal } from '../components/CouponModal';

export function CartPage() {
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);

  return (
    <main>
      <h1>장바구니</h1>
      <CartItemList items={items} />
      <p>합계 {totalPrice.toLocaleString()}원</p>
    </main>
  );
}
```
