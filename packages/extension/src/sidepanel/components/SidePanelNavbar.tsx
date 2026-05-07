import { LayoutDashboard } from 'lucide-react';
import sanLogo from '../../../../ui/src/assets/brand/SAN_LOGO.svg';
import sanTypo from '../../../../ui/src/assets/brand/SAN_TYPO.svg';

interface SidePanelNavbarProps {
  isAuthenticated: boolean;
  onOpenDashboard: () => void;
}

export default function SidePanelNavbar({
  isAuthenticated,
  onOpenDashboard,
}: SidePanelNavbarProps) {
  return (
    <div className="sticky top-0 z-20 -mx-4 flex h-16 items-center justify-between border-b border-primary-signal/15 bg-background/95 px-4 backdrop-blur-md">
      <div className="flex min-w-0 flex-1 items-center" aria-label="SAN">
        <div className="flex h-10 min-w-0 items-center gap-2.5">
          <img
            src={sanLogo}
            alt=""
            className="h-7 w-7 shrink-0 object-contain"
            aria-hidden="true"
          />
          <img
            src={sanTypo}
            alt="SAN"
            className="h-7 w-[min(108px,calc(100vw-200px))] min-w-0 shrink object-contain object-left"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenDashboard}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-signal/25 bg-primary-signal/10 text-primary-signal transition hover:border-primary-signal/60 hover:bg-primary-signal/15 active:scale-95"
          aria-label="Open dashboard"
          title="Open dashboard"
        >
          <LayoutDashboard size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={[
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition active:scale-95',
            isAuthenticated
              ? 'border-primary-signal/35 bg-primary-signal/10 text-primary-signal'
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
