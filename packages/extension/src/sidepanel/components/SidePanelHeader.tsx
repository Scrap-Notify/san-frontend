import { LayoutDashboard, Leaf } from 'lucide-react';

interface SidePanelHeaderProps {
  isAuthenticated: boolean;
  onOpenDashboard: () => void;
}

export default function SidePanelHeader({
  isAuthenticated,
  onOpenDashboard,
}: SidePanelHeaderProps) {
  return (
    <div className="flex h-14 items-center justify-between rounded-leaf border border-primary-signal/15 bg-background/90 px-4 backdrop-blur-md">
      <div className="flex items-center gap-2 text-primary-signal">
        <Leaf size={20} aria-hidden="true" />
        <div className="text-body-lg-bold">SAN</div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenDashboard}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-signal/30 bg-primary-signal/10 text-primary-signal shadow-neon-sm transition hover:border-primary-signal/70 hover:bg-primary-signal/15 hover:shadow-neon active:scale-95"
          aria-label="Open dashboard"
          title="Open dashboard"
        >
          <LayoutDashboard size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={[
            'flex h-8 w-8 items-center justify-center rounded-full border transition active:scale-95',
            isAuthenticated
              ? 'border-primary-signal/40 bg-primary-signal/10 text-primary-signal shadow-neon-sm'
              : 'border-white/10 bg-surface-highest text-text-secondary hover:bg-surface-container/40',
          ].join(' ')}
          aria-label={isAuthenticated ? 'Logged in profile' : 'Guest profile'}
          title={isAuthenticated ? 'Logged in' : 'Guest'}
        >
          <span
            className={[
              'h-2.5 w-2.5 rounded-full',
              isAuthenticated ? 'bg-primary-signal shadow-neon' : 'bg-text-secondary',
            ].join(' ')}
          />
        </button>
      </div>
    </div>
  );
}
