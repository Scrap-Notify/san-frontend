import { ArchiveSection } from '../components/ArchiveSection';
import { GraphSection } from '../components/GraphSection';

export function HomePage() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-dashboard-gap pt-dashboard-gap">
      <GraphSection />
      <ArchiveSection />
    </div>
  );
}
