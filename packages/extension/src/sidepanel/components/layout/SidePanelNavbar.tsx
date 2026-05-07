import { LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import sanLogo from '@san/ui/assets/brand/SAN_LOGO.svg';
import sanTypo from '@san/ui/assets/brand/SAN_TYPO.svg';

interface SidePanelNavbarProps {
  isAuthenticated: boolean;
  onOpenDashboard: () => void;
  onAuthButtonClick: () => void;
}

export default function SidePanelNavbar({
  isAuthenticated,
  onOpenDashboard,
  onAuthButtonClick,
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
            className="h-5 w-[min(84px,calc(100vw-200px))] min-w-0 shrink object-contain object-left"
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
          onClick={onAuthButtonClick}
          className={[
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition active:scale-95',
            isAuthenticated
              ? 'border-primary-signal/35 bg-primary-signal/10 text-primary-signal'
              : 'border-white/10 bg-surface-highest text-text-secondary hover:bg-surface-container/40',
          ].join(' ')}
          aria-label={isAuthenticated ? 'Logout' : 'Login'}
          title={isAuthenticated ? 'Logout' : 'Login'}
        >
          {isAuthenticated ? (
            <LogOut size={16} aria-hidden="true" />
          ) : (
            <LogIn size={16} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
