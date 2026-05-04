import { ArchiveSection } from '../components/ArchiveSection';
import { GraphSection } from '../components/GraphSection';

export function HomePage() {
  return (
    <div className="w-full min-w-0 space-y-[clamp(3rem,6vw,6rem)]">
      <GraphSection />
      <ArchiveSection />
    </div>
  );
}
