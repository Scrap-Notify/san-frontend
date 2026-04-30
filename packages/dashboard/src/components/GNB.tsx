import { Link, useLocation } from 'react-router-dom';

export function GNB() {
  const { pathname } = useLocation();

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-[#1e5056]/30 px-8"
      style={{ background: 'rgba(16, 20, 23, 0.85)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center gap-6">
        <Link to="/" className="group flex items-center gap-2">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#00ffc2]">
            SAN
          </span>
          <span className="h-1 w-1 rounded-full bg-[#00ffc2] shadow-[0_0_6px_#00ffc2]" />
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`rounded-full px-3 py-1.5 text-xs font-medium tracking-wide transition-all ${
              pathname === '/'
                ? 'bg-[#00ffc2]/10 text-[#00ffc2]'
                : 'text-[#83958c] hover:text-[#b9cbc1]'
            }`}
          >
            Recall
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="flex items-center gap-2 rounded-full border border-[#1e5056]/60 px-3 py-1.5 text-xs text-[#83958c] transition-all hover:border-[#00ffc2]/30 hover:text-[#b9cbc1]"
          type="button"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Select date range...
        </button>

        <button
          className="rounded-full bg-[#00ffc2] px-4 py-1.5 text-xs font-bold tracking-wide text-[#101417] shadow-[0_0_12px_rgba(0,255,194,0.3)] transition-all hover:bg-[#00ffc2]/90"
          type="button"
        >
          Add TIL
        </button>

        <button
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#83958c] transition-all hover:bg-[#1e5056]/20 hover:text-[#b9cbc1]"
          aria-label="Settings"
          type="button"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <button
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1e5056] bg-[#1e5056] text-xs font-bold text-[#00ffc2] transition-all hover:border-[#00ffc2]/50"
          aria-label="Account"
          type="button"
        >
          A
        </button>
      </div>
    </header>
  );
}
