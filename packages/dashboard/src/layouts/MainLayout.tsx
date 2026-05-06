import { Outlet, useLocation } from 'react-router-dom';
import { TopNavBar } from '../components/GNB';

export function MainLayout() {
  const location = useLocation();
  const activeMenu = getActiveMenu(location.pathname);

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] gap-[var(--dashboard-layout-gap)] overflow-x-hidden bg-[#101417] py-3 sm:py-4">
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
