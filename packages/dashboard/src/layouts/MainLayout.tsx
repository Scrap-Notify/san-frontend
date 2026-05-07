import { Outlet, useLocation } from 'react-router-dom';
import { TopNavBar } from '../components/GNB';

export function MainLayout() {
  const location = useLocation();
  const activeMenu = getActiveMenu(location.pathname);

  return (
    <div className="flex min-h-screen flex-col gap-dashboard-gap overflow-x-hidden bg-background py-dashboard-gap">
      <header className="dashboard-shell">
        <TopNavBar activeMenu={activeMenu} />
      </header>

      <main className="dashboard-shell pb-16">
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
