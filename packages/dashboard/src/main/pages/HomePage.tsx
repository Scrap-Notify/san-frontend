import { ArchiveSection } from '../components/archive/ArchiveSection';
import { GraphSection } from '../components/graph/GraphSection';
import { useLocation } from 'react-router-dom';

export function HomePage() {
  const location = useLocation();
  const notice = typeof location.state === 'object'
    && location.state
    && 'notice' in location.state
    && typeof location.state.notice === 'string'
    ? location.state.notice
    : null;

  return (
    <div className="flex w-full min-w-0 flex-col">
      {notice ? (
        <p className="rounded-leaf border border-primary-signal/20 bg-primary-signal/10 px-md py-sm text-body-sm-bold text-primary-signal">
          {notice}
        </p>
      ) : null}

      <GraphSection />

      <div className="relative z-10 -mt-6 rounded-t-[40px] bg-background pt-10">
        <div className="px-6 pb-12">
          <ArchiveSection />
        </div>
      </div>
    </div>
  );
}
