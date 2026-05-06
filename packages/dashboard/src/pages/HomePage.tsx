import { ArchiveSection } from '../components/ArchiveSection';
import { GraphSection } from '../components/GraphSection';

export function HomePage() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-[clamp(4rem,8vw,8rem)]">
      <GraphSection />
      <ArchiveSection />
    </div>
  );
}
