---
description: "fe-state: 서버 데이터는 서버 상태 도구(TanStack Query 등)에 맡긴다. useState + useEffect로 직접 관리하지 않는다"
tags: [fe-state]
expected_outcome: "최근 주문을 useQuery/useSuspenseQuery로 가져오고 로딩·실패 표시를 그 상태나 Suspense·ErrorBoundary로 처리한다"
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---

아래 프로필 페이지에 '최근 주문' 목록을 추가해줘. `fetchRecentOrders(userId)`가 이미 있고 `{ id, title, orderedAt }[]`을 돌려줘. 불러오는 중일 때와 실패했을 때 표시도 필요해.

스택은 React 18, TypeScript, @tanstack/react-query v5야. 레포 없이 물어보는 거라 파일을 직접 고칠 수는 없어. 고친 `ProfilePage.tsx` 전체 코드를 답변에 적어줘.

```tsx
// src/pages/ProfilePage.tsx
import { fetchRecentOrders } from '../api/orders';

type Props = { userId: string; userName: string };

export function ProfilePage({ userId, userName }: Props) {
  return (
    <main>
      <h1>{userName}님의 프로필</h1>
    </main>
  );
}
```
