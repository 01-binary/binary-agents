// 오답지 (떨어져야 하는 답). 한 페이지에서만 쓰는 모달 열림 여부를 전역 스토어에 올렸다.

// src/stores/cartStore.ts
import { create } from 'zustand';

type CartState = {
  items: CartItem[];
  totalPrice: number;
  isCouponModalOpen: boolean;
  openCouponModal: () => void;
  closeCouponModal: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  totalPrice: 0,
  isCouponModalOpen: false,
  openCouponModal: () => set({ isCouponModalOpen: true }),
  closeCouponModal: () => set({ isCouponModalOpen: false }),
}));

// src/pages/CartPage.tsx
import { useCartStore } from '../stores/cartStore';
import { CartItemList } from '../components/CartItemList';
import { CouponModal } from '../components/CouponModal';

export function CartPage() {
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const isCouponModalOpen = useCartStore((state) => state.isCouponModalOpen);
  const openCouponModal = useCartStore((state) => state.openCouponModal);
  const closeCouponModal = useCartStore((state) => state.closeCouponModal);

  return (
    <main>
      <h1>장바구니</h1>
      <CartItemList items={items} />
      <p>합계 {totalPrice.toLocaleString()}원</p>
      <button type="button" onClick={openCouponModal}>
        쿠폰 입력
      </button>
      {isCouponModalOpen && <CouponModal onClose={closeCouponModal} />}
    </main>
  );
}
