// 오답지 (떨어져야 하는 답). 서버 데이터를 useState + useEffect로 직접 관리한다.
import { useEffect, useState } from 'react';
import { fetchRecentOrders } from '../api/orders';

type Props = { userId: string; userName: string };
type Order = { id: string; title: string; orderedAt: string };

export function ProfilePage({ userId, userName }: Props) {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchRecentOrders(userId)
      .then(setRecentOrders)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <main>
      <h1>{userName}님의 프로필</h1>
      <section>
        <h2>최근 주문</h2>
        {loading && <p>불러오는 중…</p>}
        {error && <p role="alert">최근 주문을 불러오지 못했어요.</p>}
        <ul>
          {recentOrders.map((order) => (
            <li key={order.id}>
              {order.title} <time dateTime={order.orderedAt}>{order.orderedAt}</time>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
