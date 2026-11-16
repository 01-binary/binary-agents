---
description: "fe-a11y 1번: 클릭 가능한 div 대신 네이티브 요소. 페이지 이동이면 링크로 만든다"
tags: [fe-a11y]
expected_outcome: "카드를 <Link>나 <a>로 만들어 키보드 포커스·새 탭 열기가 되게 한다. div에 onClick과 navigate만 붙이지 않는다"
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---

react-router를 쓰는 프로젝트야. 아래 상품 카드를 누르면 상품 상세 페이지(`/products/:id`)로 이동하게 해줘. 카드 어디를 눌러도 이동해야 해.

레포 없이 물어보는 거라 파일을 직접 고칠 수는 없어. 고친 `ProductCard.tsx` 전체 코드를 답변에 적어줘.

```tsx
// src/components/ProductCard.tsx
type Props = { id: string; name: string; price: number; imageUrl: string };

export function ProductCard({ id, name, price, imageUrl }: Props) {
  return (
    <div className="card">
      <img src={imageUrl} alt="" />
      <strong>{name}</strong>
      <span>{price.toLocaleString()}원</span>
    </div>
  );
}
```
