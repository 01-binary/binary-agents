// 정답지 (붙어야 하는 답). 채점기 검사용이며 실행 중인 에이전트에게는 보이지 않는다.
import { useQuery } from '@tanstack/react-query';
import { fetchRecentOrders } from '../api/orders';

type Props = { userId: string; userName: string };

export function ProfilePage({ userId, userName }: Props) {
  const {
    data: recentOrders,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['recentOrders', userId],
    queryFn: () => fetchRecentOrders(userId),
  });

  return (
    <main>
      <h1>{userName}님의 프로필</h1>
      <section aria-labelledby="recent-orders-heading">
        <h2 id="recent-orders-heading">최근 주문</h2>
        {isPending && <p>불러오는 중…</p>}
        {isError && <p role="alert">최근 주문을 불러오지 못했어요.</p>}
        {recentOrders && (
          <ul>
            {recentOrders.map((order) => (
              <li key={order.id}>
                {order.title} <time dateTime={order.orderedAt}>{order.orderedAt}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
