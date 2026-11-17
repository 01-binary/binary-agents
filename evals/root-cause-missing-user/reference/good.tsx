type User = { id: string; name: string; grade: 'BASIC' | 'VIP' };
type Order = { id: string; buyerId: string; totalPrice: number };

export function OrderSummary({ order, users }: { order: Order; users: User[] }) {
  const buyer = users.find((user) => user.id === order.buyerId);
  if (!buyer) {
    throw new Error(`주문 ${order.id}의 구매자(${order.buyerId})를 찾을 수 없음`);
  }

  return (
    <section>
      <h2>주문 {order.id}</h2>
      <p>구매자: {buyer.name}</p>
      {buyer.grade === 'VIP' && <span>VIP 할인 적용</span>}
      <p>결제 금액: {order.totalPrice.toLocaleString()}원</p>
    </section>
  );
}
