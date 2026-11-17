// src/contexts/UserContext.tsx
import { createContext, useContext, type ReactNode } from 'react';
import type { User } from '../api/me';

const UserContext = createContext<User | null>(null);

export function UserProvider({ user, children }: { user: User; children: ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  const user = useContext(UserContext);
  if (!user) throw new Error('UserProvider 안에서 써야 함');
  return user;
}

// src/components/UserMenu.tsx
export function UserMenu() {
  const user = useUser();
  return <div className="user-menu">{user.name}님</div>;
}
