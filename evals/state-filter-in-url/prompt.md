---
description: "fe-state: 검색·필터 값은 URL 파라미터에 둔다. useState에만 두면 새로고침·링크 공유 때 사라진다"
tags: [fe-state]
expected_outcome: "선택된 카테고리를 useSearchParams 등으로 URL 쿼리에 저장하고 그 값으로 목록을 거른다"
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---

react-router를 쓰는 프로젝트야. 아래 상품 목록 페이지에 카테고리 필터를 넣어줘. 카테고리는 전체, 상의, 하의, 신발이고, 하나를 고르면 그 카테고리 상품만 보여야 해. 상품에는 `category` 필드(`'top' | 'bottom' | 'shoes'`)가 있어.

레포 없이 물어보는 거라 파일을 직접 고칠 수는 없어. 고친 `ProductListPage.tsx` 전체 코드를 답변에 적어줘.

```tsx
// src/pages/ProductListPage.tsx
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../api/products';

export function ProductListPage() {
  const { data: products } = useSuspenseQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </li>
      ))}
    </ul>
  );
}
```
