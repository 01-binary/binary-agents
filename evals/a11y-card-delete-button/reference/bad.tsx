import { Link } from 'react-router-dom';
import { TrashIcon } from './icons';

type Props = { id: string; name: string; price: number; imageUrl: string; onDelete: (id: string) => void };

export function ProductCard({ id, name, price, imageUrl, onDelete }: Props) {
  return (
    <Link to={`/products/${id}`} className="card">
      <button
        type="button"
        aria-label="삭제"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(id);
        }}
      >
        <TrashIcon />
      </button>
      <img src={imageUrl} alt="" />
      <strong>{name}</strong>
      <span>{price.toLocaleString()}원</span>
    </Link>
  );
}
