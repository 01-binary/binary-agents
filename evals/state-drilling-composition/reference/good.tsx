// src/pages/DashboardPage.tsx
export function DashboardPage() {
  const { data: user } = useSuspenseQuery({ queryKey: ['me'], queryFn: fetchMe });
  return (
    <Layout sidebar={<Sidebar userMenu={<UserMenu user={user} />} />}>
      <DashboardContent />
    </Layout>
  );
}

// src/components/Layout.tsx
export function Layout({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  return (
    <div className="layout">
      {sidebar}
      <main>{children}</main>
    </div>
  );
}

// src/components/Sidebar.tsx
export function Sidebar({ userMenu }: { userMenu: ReactNode }) {
  return (
    <aside>
      <NavLinks />
      {userMenu}
    </aside>
  );
}
