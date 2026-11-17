import { Link } from 'react-router-dom';
import { TrashIcon } from './icons';

type Props = { id: string; name: string; price: number; imageUrl: string; onDelete: (id: string) => void };

export function ProductCard({ id, name, price, imageUrl, onDelete }: Props) {
  return (
    <div className="card" style={{ position: 'relative' }}>
      <img src={imageUrl} alt="" />
      <Link to={`/products/${id}`} className="card-link">
        <strong>{name}</strong>
      </Link>
      <span>{price.toLocaleString()}원</span>
      <button type="button" aria-label={`${name} 삭제`} onClick={() => onDelete(id)} className="card-delete">
        <TrashIcon aria-hidden />
      </button>
    </div>
  );
}
// .card-link::after { content: ''; position: absolute; inset: 0; }
// .card-delete { position: relative; z-index: 1; }
