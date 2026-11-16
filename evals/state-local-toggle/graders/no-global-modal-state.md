---
# 새 Context를 만들거나, 스토어 selector로 쿠폰·모달 상태를 읽으면 탈락 (예: useCartStore((state) => state.isCouponModalOpen))
type: regex
pattern: 'createContext|\b(state|s)\s*\)?\s*=>\s*(state|s)\.\w*(coupon|modal)\w*'
flags: i
match: not_contains
---
