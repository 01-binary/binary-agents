// 정답지 (붙어야 하는 답). 채점기 검사용이며 실행 중인 에이전트에게는 보이지 않는다.
import { useState } from 'react';
import { useCartStore } from '../stores/cartStore';
import { CartItemList } from '../components/CartItemList';
import { CouponModal } from '../components/CouponModal';

export function CartPage() {
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  return (
    <main>
      <h1>장바구니</h1>
      <CartItemList items={items} />
      <p>합계 {totalPrice.toLocaleString()}원</p>
      <button type="button" onClick={() => setIsCouponModalOpen(true)}>
        쿠폰 입력
      </button>
      {isCouponModalOpen && <CouponModal onClose={() => setIsCouponModalOpen(false)} />}
    </main>
  );
}
