// packages/dashboard/src/pages/HomePage.tsx
// GNB는 MainLayout이 담당 → 여기선 콘텐츠만

import { GraphSection } from '../components/GraphSection';
import { ArchiveSection } from '../components/ArchiveSection';

export function HomePage() {
  return (
    <>
      <GraphSection />
      <div className="h-px bg-[#1e5056]/20 mb-10" />
      <ArchiveSection />
    </>
  );
}
