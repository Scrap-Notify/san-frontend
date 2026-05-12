import { LayoutDashboard, LogOut, User } from 'lucide-react';
import sanLogo from '@san/ui/assets/brand/SAN_LOGO.svg';
import sanTypo from '@san/ui/assets/brand/SAN_TYPO.svg';

interface SidePanelNavbarProps {
  isAuthenticated: boolean;
  isProfileMenuOpen: boolean;
  onOpenDashboard: () => void;
  onProfileButtonClick: () => void;
  onLogoutClick: () => void;
}

export default function SidePanelNavbar({
  isAuthenticated,
  isProfileMenuOpen,
  onOpenDashboard,
  onProfileButtonClick,
  onLogoutClick,
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
        <div className="relative">
          <button
            type="button"
            onClick={onProfileButtonClick}
            className={[
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition active:scale-95',
              isAuthenticated
                ? 'border-primary-signal/35 bg-primary-signal/10 text-primary-signal'
                : 'border-white/10 bg-surface-highest text-text-secondary hover:bg-surface-container/40',
            ].join(' ')}
            aria-label={isAuthenticated ? 'User profile' : 'Login'}
            aria-expanded={isAuthenticated ? isProfileMenuOpen : undefined}
            title={isAuthenticated ? 'User profile' : 'Login'}
          >
            <User size={16} strokeWidth={1.6} aria-hidden="true" />
          </button>

          {isAuthenticated && isProfileMenuOpen && (
            <div className="absolute right-0 top-10 w-40 overflow-hidden rounded-lg border border-white/[0.16] bg-white/[0.08] p-1.5 shadow-[0_16px_36px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl">
              <button
                type="button"
                onClick={onOpenDashboard}
                className="flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-xs font-semibold text-text-secondary transition hover:bg-white/8 hover:text-text-primary"
              >
                <LayoutDashboard size={14} aria-hidden="true" />
                Dashboard
              </button>
              <button
                type="button"
                onClick={onLogoutClick}
                className="flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-xs font-semibold text-text-secondary transition hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut size={14} aria-hidden="true" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
