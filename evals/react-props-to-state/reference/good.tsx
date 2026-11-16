// 정답지 (붙어야 하는 답). 채점기 검사용이며 실행 중인 에이전트에게는 보이지 않는다.
import type { ReactNode } from 'react';

type Props = { isOpen: boolean; title: string; onClose: () => void; children: ReactNode };

export function Drawer({ isOpen, title, onClose, children }: Props) {
  if (!isOpen) return null;

  return (
    <aside className="drawer">
      <h2>{title}</h2>
      <button type="button" onClick={onClose}>
        닫기
      </button>
      {children}
    </aside>
  );
}
