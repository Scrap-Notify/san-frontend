import { LayoutDashboard } from 'lucide-react';

interface SidePanelHeaderProps {
  isAuthenticated: boolean;
  onOpenDashboard: () => void;
}

export default function SidePanelHeader({
  isAuthenticated,
  onOpenDashboard,
}: SidePanelHeaderProps) {
  return (
    <div className="flex h-14 items-center justify-between border-b border-primary-signal/10 bg-background/80 px-popover-padding backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="text-body-lg-bold text-primary-signal">SAN</div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenDashboard}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-signal/30 text-primary-signal transition hover:border-primary-signal/70 hover:bg-primary-signal/10 active:scale-95"
          aria-label="Open dashboard"
          title="Open dashboard"
        >
          <LayoutDashboard size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={[
            'flex h-8 w-8 items-center justify-center rounded-full border text-caption font-black transition',
            isAuthenticated
              ? 'border-primary-signal/40 bg-primary-signal/10 text-primary-signal'
              : 'border-white/10 bg-surface-highest text-text-secondary',
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
