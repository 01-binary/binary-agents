// 정답지 (붙어야 하는 답). 채점기 검사용이며 실행 중인 에이전트에게는 보이지 않는다.
import { Link } from 'react-router-dom';

type Props = { id: string; name: string; price: number; imageUrl: string };

export function ProductCard({ id, name, price, imageUrl }: Props) {
  return (
    <Link to={`/products/${id}`} className="card">
      <img src={imageUrl} alt="" />
      <strong>{name}</strong>
      <span>{price.toLocaleString()}원</span>
    </Link>
  );
}
