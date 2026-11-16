// 오답지 (떨어져야 하는 답). div에 onClick만 붙여서 키보드로 포커스·실행이 안 되고 새 탭 열기도 안 된다.
import { useNavigate } from 'react-router-dom';

type Props = { id: string; name: string; price: number; imageUrl: string };

export function ProductCard({ id, name, price, imageUrl }: Props) {
  const navigate = useNavigate();

  return (
    <div className="card" onClick={() => navigate(`/products/${id}`)} style={{ cursor: 'pointer' }}>
      <img src={imageUrl} alt="" />
      <strong>{name}</strong>
      <span>{price.toLocaleString()}원</span>
    </div>
  );
}
