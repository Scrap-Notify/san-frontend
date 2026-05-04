import { Outlet } from 'react-router-dom';
import { GNB } from '../components/GNB';

export function MainLayout() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#101417]">
      <header className="dashboard-shell py-4">
        <GNB />
      </header>

      <main className="dashboard-shell pt-6 pb-16 md:pt-8 lg:pt-10">
        <Outlet />
      </main>
    </div>
  );
}
