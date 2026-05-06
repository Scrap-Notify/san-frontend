import { Outlet } from 'react-router-dom';
import { GNB } from '../components/GNB';

export function MainLayout() {
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] gap-[var(--dashboard-layout-gap)] overflow-x-hidden bg-[#101417] py-3 sm:py-4">
      <header className="dashboard-shell">
        <GNB />
      </header>

      <main className="dashboard-shell pb-16">
        <Outlet />
      </main>
    </div>
  );
}
