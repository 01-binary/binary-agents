// 오답지 (떨어져야 하는 답). 버튼 안에 아이콘만 있어서 스크린 리더가 "버튼"이라고만 읽는다.
import type { ReactNode } from 'react';
import { CloseIcon } from '../icons/CloseIcon';

type Props = { title: string; onClose: () => void; children: ReactNode };

export function Modal({ title, onClose, children }: Props) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="modal">
      <header className="modal-header">
        <h2 id="modal-title">{title}</h2>
        <button type="button" className="modal-close" onClick={() => onClose()}>
          <CloseIcon />
        </button>
      </header>
      <div className="modal-body">{children}</div>
    </div>
  );
}
