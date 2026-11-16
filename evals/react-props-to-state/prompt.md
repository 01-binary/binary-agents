---
description: "fe-react Red Flag: 받은 props를 state로 복사하지 않는다. 부모가 소유한 상태는 콜백 props로 바꿔 달라고 요청한다"
tags: [fe-react]
expected_outcome: "onClose 같은 콜백 props를 추가해 닫기 버튼에서 호출한다. useState(isOpen)으로 복사하지 않는다"
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---

아래 `Drawer` 안에 닫기 버튼을 추가해줘. 지금은 부모가 `isOpen`으로 열고 닫는데, 드로어 안에서도 닫을 수 있어야 해.

레포 없이 물어보는 거라 파일을 직접 고칠 수는 없어. 고친 `Drawer.tsx` 전체 코드를 답변에 적어줘.

```tsx
// src/components/Drawer.tsx
import type { ReactNode } from 'react';

type Props = { isOpen: boolean; title: string; children: ReactNode };

export function Drawer({ isOpen, title, children }: Props) {
  if (!isOpen) return null;

  return (
    <aside className="drawer">
      <h2>{title}</h2>
      {children}
    </aside>
  );
}
```
