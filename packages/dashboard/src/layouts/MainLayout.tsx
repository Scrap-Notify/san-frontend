// packages/dashboard/src/layouts/MainLayout.tsx
// GNB가 필요한 모든 페이지에 씌우는 레이아웃
// router.tsx에서 레벨로 적용 → 각 페이지에서 GNB 직접 import 불필요

import { Outlet } from 'react-router-dom';
import { GNB } from '../components/GNB';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-[#101417]">
      <div className="mx-auto min-h-[810px] w-full max-w-[1440px] px-[60px] py-6">
        <GNB />
        <main className="pt-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
