// 오답지 (떨어져야 하는 답). 필터 값을 컴포넌트 상태에만 둬서 새로고침·링크 공유 때 사라진다.
import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../api/products';

const CATEGORIES = [
  { value: 'all', label: '전체' },
  { value: 'top', label: '상의' },
  { value: 'bottom', label: '하의' },
  { value: 'shoes', label: '신발' },
] as const;

export function ProductListPage() {
  const [category, setCategory] = useState('all');

  const { data: products } = useSuspenseQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const visibleProducts =
    category === 'all' ? products : products.filter((product) => product.category === category);

  return (
    <>
      <div role="group" aria-label="카테고리">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={category === value}
            onClick={() => setCategory(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <ul>
        {visibleProducts.map((product) => (
          <li key={product.id}>
            <Link to={`/products/${product.id}`}>{product.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
