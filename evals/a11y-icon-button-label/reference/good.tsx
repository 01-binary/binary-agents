// 정답지 (붙어야 하는 답). 채점기 검사용이며 실행 중인 에이전트에게는 보이지 않는다.
import type { ReactNode } from 'react';
import { CloseIcon } from '../icons/CloseIcon';

type Props = { title: string; onClose: () => void; children: ReactNode };

export function Modal({ title, onClose, children }: Props) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="modal">
      <header className="modal-header">
        <h2 id="modal-title">{title}</h2>
        <button type="button" className="modal-close" onClick={() => onClose()} aria-label="닫기">
          <CloseIcon aria-hidden />
        </button>
      </header>
      <div className="modal-body">{children}</div>
    </div>
  );
}
