import { Outlet } from 'react-router-dom';
import { TopNavBar } from '../components/GNB';

export function MainLayout() {
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] gap-[var(--dashboard-layout-gap)] overflow-x-hidden bg-[#101417] py-3 sm:py-4">
      <header className="dashboard-shell">
        <TopNavBar
          activeMenu="Recall"
          dateRangeLabel="Select date range..."
          userAvatarUrl="/user-profile.png"
          onDateRangeClick={() => console.log('date range')}
          onCreateTil={() => console.log('create til')}
          onSettingsClick={() => console.log('settings')}
        />
      </header>

      <main className="dashboard-shell pb-16">
        <Outlet />
      </main>
    </div>
  );
}
