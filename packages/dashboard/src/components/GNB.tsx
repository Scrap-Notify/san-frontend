import { Calendar, Menu, Plus, Settings, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export function GNB() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isRecall = location.pathname === '/';

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="w-full min-w-0 rounded-3xl border border-white/5 bg-black/35 px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl md:rounded-full md:px-5">
      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4 lg:gap-6">
          <Link
            to="/"
            onClick={closeMenu}
            className="shrink-0 text-xl font-black leading-none tracking-tight text-white md:text-2xl"
          >
            SAN
          </Link>

          <Link
            to="/"
            onClick={closeMenu}
            className={[
              'hidden truncate rounded-full px-3 py-1.5 text-sm font-bold transition md:inline-flex md:text-base',
              isRecall
                ? 'bg-[#00ffc2]/10 text-[#00ffc2]'
                : 'text-[#b9cbc1] hover:bg-white/5 hover:text-white',
            ].join(' ')}
          >
            Recall
          </Link>
        </div>

        <div className="hidden min-w-0 items-center justify-end gap-2 md:flex">
          <DesktopActions locationPath={location.pathname} />
        </div>

        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/5 bg-[#1b2023] text-[#b9cbc1] transition hover:border-[#00ffc2]/30 hover:text-white md:hidden"
          onClick={() => setIsOpen((current) => !current)}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {isOpen ? (
        <div className="mt-4 grid gap-2 border-t border-white/5 pt-4 md:hidden">
          <MobileLink to="/" active={isRecall} onClick={closeMenu}>
            Recall
          </MobileLink>
          <MobileLink to="/date-range" onClick={closeMenu} icon={<Calendar className="h-4 w-4" />}>
            Date range
          </MobileLink>
          <MobileLink to="/til" onClick={closeMenu} icon={<Plus className="h-4 w-4" />}>
            TIL
          </MobileLink>
          <MobileLink
            to="/settings"
            active={location.pathname.startsWith('/settings')}
            onClick={closeMenu}
            icon={<Settings className="h-4 w-4" />}
          >
            Settings
          </MobileLink>
          <MobileLink to="/account" onClick={closeMenu}>
            Account
          </MobileLink>
        </div>
      ) : null}
    </nav>
  );
}

function DesktopActions({ locationPath }: { locationPath: string }) {
  return (
    <>
      <Link
        to="/date-range"
        className="flex min-h-9 min-w-0 items-center justify-center gap-2 rounded-full border border-white/5 bg-[#1b2023] px-4 py-1.5 text-sm font-medium text-[#b9cbc1] transition hover:border-[#00ffc2]/30 hover:text-white"
      >
        <Calendar className="h-4 w-4 shrink-0" />
        <span className="truncate">Date</span>
      </Link>

      <Link
        to="/til"
        className="flex min-h-9 min-w-0 items-center justify-center gap-2 rounded-full bg-[#00ffc2] px-5 py-1.5 text-sm font-bold text-[#101417] shadow-[0_0_24px_rgba(0,255,194,0.16)] transition hover:bg-[#1affcb]"
      >
        <Plus className="h-4 w-4" />
        <span>TIL</span>
      </Link>

      <Link
        to="/settings"
        className={[
          'transition',
          locationPath.startsWith('/settings') ? 'text-[#00ffc2]' : 'text-[#b9cbc1] hover:text-white',
        ].join(' ')}
        aria-label="Settings"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/5 bg-[#1b2023] transition hover:border-[#00ffc2]/30">
          <Settings className="h-4 w-4" />
        </span>
      </Link>

      <Link
        to="/account"
        className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#1e5056] ring-1 ring-white/10 transition hover:ring-[#00ffc2]/40"
        aria-label="Account"
      >
        <img src="/avatar.png" alt="profile" className="h-full w-full object-cover" />
      </Link>
    </>
  );
}

function MobileLink({
  to,
  active = false,
  icon,
  children,
  onClick,
}: {
  to: string;
  active?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={[
        'flex min-h-11 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition',
        active
          ? 'bg-[#00ffc2]/10 text-[#00ffc2]'
          : 'bg-[#1b2023]/70 text-[#b9cbc1] hover:bg-white/5 hover:text-white',
      ].join(' ')}
    >
      {icon ? <span className="text-current">{icon}</span> : null}
      <span>{children}</span>
    </Link>
  );
}
