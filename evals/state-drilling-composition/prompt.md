---
description: "fe-state 5단계 에스컬레이터: 중간이 안 쓰는 3단계 이상 prop drilling은 Context·전역 스토어보다 컴포넌트 합성을 먼저 시도한다"
tags: [fe-state]
expected_outcome: "DashboardPage가 <UserMenu user={user} />를 만들어 children이나 슬롯 prop으로 Layout·Sidebar에 넘긴다. createContext나 스토어를 새로 만들지 않는다"
plugins: ["../..", "../../.eval-deps/mattpocock-skills"]
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---

`user`가 `Layout`이랑 `Sidebar`에서는 안 쓰이는데 `UserMenu`까지 가려고 계속 props로 내려가고 있어. 지저분하니까 정리해줘. `UserMenu`는 이 사이드바에서만 써.

레포 없이 물어보는 거라 파일을 직접 고칠 수는 없어. 설명은 필요 없고, 고친 파일들 전체 코드만 적어줘.

```tsx
// src/pages/DashboardPage.tsx
import { useSuspenseQuery } from '@tanstack/react-query';
import { fetchMe } from '../api/me';
import { Layout } from '../components/Layout';
import { DashboardContent } from '../components/DashboardContent';

export function DashboardPage() {
  const { data: user } = useSuspenseQuery({ queryKey: ['me'], queryFn: fetchMe });
  return (
    <Layout user={user}>
      <DashboardContent />
    </Layout>
  );
}

// src/components/Layout.tsx
import type { ReactNode } from 'react';
import type { User } from '../api/me';
import { Sidebar } from './Sidebar';

export function Layout({ user, children }: { user: User; children: ReactNode }) {
  return (
    <div className="layout">
      <Sidebar user={user} />
      <main>{children}</main>
    </div>
  );
}

// src/components/Sidebar.tsx
import type { User } from '../api/me';
import { NavLinks } from './NavLinks';
import { UserMenu } from './UserMenu';

export function Sidebar({ user }: { user: User }) {
  return (
    <aside>
      <NavLinks />
      <UserMenu user={user} />
    </aside>
  );
}

// src/components/UserMenu.tsx
import type { User } from '../api/me';

export function UserMenu({ user }: { user: User }) {
  return <div className="user-menu">{user.name}님</div>;
}
```
