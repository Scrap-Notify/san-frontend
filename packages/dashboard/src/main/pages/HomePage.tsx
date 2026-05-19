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
    <div className="flex w-full min-w-0 flex-col gap-8 py-12">
      {notice ? (
        <p className="rounded-leaf border border-primary-signal/20 bg-primary-signal/10 px-md py-sm text-body-sm-bold text-primary-signal">
          {notice}
        </p>
      ) : null}
      <ArchiveSection />
      <GraphSection />
    </div>
  );
}
