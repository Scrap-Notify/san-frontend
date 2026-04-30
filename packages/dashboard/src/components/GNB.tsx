// packages/dashboard/src/components/GNB.tsx
// 상단 글로벌 네비게이션 바
// SAN 로고 | 리콜 탭 | 날짜 필터 + TIL 작성 버튼 + 설정 + 프로필

import { Link, useLocation } from 'react-router-dom';

export function GNB() {
  const { pathname } = useLocation();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between
                 px-8 h-14 border-b border-[#1e5056]/30"
      style={{ background: 'rgba(16, 20, 23, 0.85)', backdropFilter: 'blur(12px)' }}
    >
      {/* 좌측 — 로고 + 탭 */}
      <div className="flex items-center gap-6">
        {/* SAN 로고 */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-sm font-bold tracking-[0.2em] text-[#00ffc2] uppercase">
            SAN
          </span>
          <span className="w-1 h-1 rounded-full bg-[#00ffc2] shadow-[0_0_6px_#00ffc2]" />
        </Link>

        {/* 리콜 탭 */}
        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all
              ${pathname === '/'
                ? 'text-[#00ffc2] bg-[#00ffc2]/10'
                : 'text-[#83958c] hover:text-[#b9cbc1]'
              }`}
          >
            리콜(Recall)
          </Link>
        </nav>
      </div>

      {/* 우측 — 날짜 필터 + TIL 버튼 + 아이콘들 */}
      <div className="flex items-center gap-3">

        {/* 날짜 필터 */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-full
                     border border-[#1e5056]/60 text-[#83958c] text-xs
                     hover:border-[#00ffc2]/30 hover:text-[#b9cbc1] transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Select date range...
        </button>

        {/* TIL 작성 버튼 */}
        <button
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full
                     bg-[#00ffc2] text-[#101417] text-xs font-bold tracking-wide
                     hover:bg-[#00ffc2]/90 transition-all shadow-[0_0_12px_rgba(0,255,194,0.3)]"
        >
          TIL 작성(+)
        </button>

        {/* 설정 아이콘 */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full
                     text-[#83958c] hover:text-[#b9cbc1] hover:bg-[#1e5056]/20 transition-all"
          aria-label="설정"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            />
          </svg>
        </button>

        {/* 프로필 아바타 */}
        <button
          className="w-8 h-8 rounded-full bg-[#1e5056] border border-[#1e5056]
                     flex items-center justify-center text-[#00ffc2] text-xs font-bold
                     hover:border-[#00ffc2]/50 transition-all"
          aria-label="프로필"
        >
          A
        </button>

      </div>
    </header>
  );
}
