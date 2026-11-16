---
description: "fe-a11y 4번: 아이콘만 있는 버튼에는 스크린 리더가 읽을 이름을 준다"
tags: [fe-a11y]
expected_outcome: "닫기 버튼에 aria-label 등으로 이름을 준다. 아이콘만 넣고 끝내지 않는다"
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---

아래 모달의 헤더 오른쪽에 닫기 버튼을 추가해줘. 글자 없이 `CloseIcon`만 보이면 되고, 누르면 `onClose`를 호출해.

레포 없이 물어보는 거라 파일을 직접 고칠 수는 없어. 고친 `Modal.tsx` 전체 코드를 답변에 적어줘.

```tsx
// src/components/Modal.tsx
import type { ReactNode } from 'react';
import { CloseIcon } from '../icons/CloseIcon';

type Props = { title: string; onClose: () => void; children: ReactNode };

export function Modal({ title, onClose, children }: Props) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="modal">
      <header className="modal-header">
        <h2 id="modal-title">{title}</h2>
      </header>
      <div className="modal-body">{children}</div>
    </div>
  );
}
```
