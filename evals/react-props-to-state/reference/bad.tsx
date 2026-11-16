// 오답지 (떨어져야 하는 답). 받은 isOpen을 state로 복사해서, 부모가 다시 열어도 반영되지 않는다.
import { useState } from 'react';
import type { ReactNode } from 'react';

type Props = { isOpen: boolean; title: string; children: ReactNode };

export function Drawer({ isOpen, title, children }: Props) {
  const [open, setOpen] = useState(isOpen);

  if (!open) return null;

  return (
    <aside className="drawer">
      <h2>{title}</h2>
      <button type="button" onClick={() => setOpen(false)}>
        닫기
      </button>
      {children}
    </aside>
  );
}
