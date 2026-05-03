import { Link, useLocation } from 'react-router-dom';
import { Calendar, Settings } from 'lucide-react';

export function GNB() {
  const location = useLocation();

  const isRecall = location.pathname === '/';

  return (
    <nav className="flex h-14 w-full items-center justify-between rounded-full bg-black/35 px-5 backdrop-blur-xl">
      {/* Left */}
      <div className="flex items-center gap-8">
        <Link
          to="/"
          className="text-2xl font-black tracking-tight text-white"
        >
          SAN
        </Link>

        <Link
          to="/"
          className={[
            'pb-1 text-lg font-bold transition',
            isRecall
              ? 'border-b-2 border-[#00ffc2] text-[#00ffc2]'
              : 'text-[#b9cbc1] hover:text-white',
          ].join(' ')}
        >
          리콜(Recall)
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <div className="flex h-11 items-center gap-3 rounded-full bg-[#1b2023] px-4">
          <Calendar className="h-4 w-4 text-[#b9cbc1]" />

          <button
            type="button"
            className="h-9 rounded-full border border-[#00ffc2] px-5 text-sm text-[#b9cbc1]"
          >
            Select date range...
          </button>
        </div>

        <button
          type="button"
          className="h-11 rounded-full bg-[#00ffc2] px-8 text-base font-bold text-[#101417]"
        >
          TIL 작성 (+)
        </button>

        <Link
          to="/settings"
          className={[
            'transition',
            location.pathname.startsWith('/settings')
              ? 'text-[#00ffc2]'
              : 'text-[#b9cbc1] hover:text-white',
          ].join(' ')}
        >
          <Settings className="h-6 w-6" />
        </Link>

        <Link
          to="/account"
          className="h-11 w-11 overflow-hidden rounded-full ring-1 ring-white/10"
        >
          <img
            src="/avatar.png"
            alt="profile"
            className="h-full w-full object-cover"
          />
        </Link>
      </div>
    </nav>
  );
}