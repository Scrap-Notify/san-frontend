import { Outlet, useLocation } from 'react-router-dom';
import { TopNavBar } from '@dashboard/main/components/GNB';

export function MainLayout() {
  const location = useLocation();
  const activeMenu = getActiveMenu(location.pathname);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      <header className="sticky top-0 z-50 w-full">
        <TopNavBar activeMenu={activeMenu} />
      </header>

      <main className="dashboard-shell mt-8 pb-16">
        <Outlet />
      </main>
    </div>
  );
}

function getActiveMenu(pathname: string) {
  if (pathname.startsWith('/til')) return 'TIL';
  if (pathname.startsWith('/result')) return 'Search';
  if (pathname.startsWith('/settings')) return 'GitHub';
  return 'Dashboard';
}
