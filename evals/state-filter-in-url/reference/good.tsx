// 정답지 (붙어야 하는 답). 채점기 검사용이며 실행 중인 에이전트에게는 보이지 않는다.
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api/products';

const CATEGORIES = [
  { value: 'all', label: '전체' },
  { value: 'top', label: '상의' },
  { value: 'bottom', label: '하의' },
  { value: 'shoes', label: '신발' },
] as const;

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? 'all';

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
            onClick={() => setSearchParams(value === 'all' ? {} : { category: value })}
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
