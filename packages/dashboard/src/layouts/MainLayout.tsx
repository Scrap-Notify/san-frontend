// packages/dashboard/src/layouts/MainLayout.tsx
// GNB가 필요한 모든 페이지에 씌우는 레이아웃
// router.tsx에서 레벨로 적용 → 각 페이지에서 GNB 직접 import 불필요

import { Outlet } from 'react-router-dom';
import { GNB } from '../components/GNB';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-[#101417]">
      {/* 고정 GNB */}
      <GNB />
      {/* GNB 높이(56px)만큼 상단 여백 — 각 페이지가 신경 쓸 필요 없음 */}
      <main className="pt-14">
        <Outlet />
      </main>
    </div>
  );
}
