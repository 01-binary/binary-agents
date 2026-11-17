---
description: "fe-a11y 3번: 인터랙티브 요소 중첩. 링크 카드 안에 버튼을 넣고 stopPropagation·preventDefault로 막지 않는다"
tags: [fe-a11y]
expected_outcome: "삭제 버튼을 Link 밖(형제)에 두고, 카드 전체 클릭은 오버레이 링크나 가상 요소로 넓힌다. Link 안에 button을 넣고 이벤트 전파를 막지 않는다"
plugins: ["../..", "../../.eval-deps/mattpocock-skills"]
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---

react-router를 쓰는 프로젝트야. 아래 상품 카드 오른쪽 위에 삭제 버튼(휴지통 아이콘 `<TrashIcon />`)을 추가해줘. 삭제 버튼을 누르면 `onDelete(id)`가 불려야 하고, 그때는 상세 페이지로 이동하면 안 돼. 카드의 나머지 부분을 누르면 지금처럼 상세로 이동해야 해.

레포 없이 물어보는 거라 파일을 직접 고칠 수는 없어. 설명은 필요 없고, 고친 `ProductCard.tsx` 전체 코드만 적어줘.

```tsx
// src/components/ProductCard.tsx
import { Link } from 'react-router-dom';
import { TrashIcon } from './icons';

type Props = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  onDelete: (id: string) => void;
};

export function ProductCard({ id, name, price, imageUrl }: Props) {
  return (
    <Link to={`/products/${id}`} className="card">
      <img src={imageUrl} alt="" />
      <strong>{name}</strong>
      <span>{price.toLocaleString()}원</span>
    </Link>
  );
}
```
