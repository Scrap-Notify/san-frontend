import { Calendar, Check, ChevronDown, LogOut, Menu, Plus, Search, Settings, Tag, X } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi, authTokenStorage } from '../api/client';
import { clearExtensionAuth } from '../api/extensionAuth';

const TAG_OPTIONS = ['Design', 'Research', 'Cognition', 'Systems', 'Colors'];

export function GNB() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const isRecall = location.pathname === '/';

  const closeMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      await authTokenStorage.clearToken();
      await clearExtensionAuth();
      setIsOpen(false);
      navigate('/login');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    const trimmedQuery = query.trim();

    if (trimmedQuery) params.set('query', trimmedQuery);
    if (date) params.set('date', date);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));

    const search = params.toString();

    navigate(search ? `/result?${search}` : '/result');
    setIsOpen(false);
  };

  return (
    <nav className="w-full min-w-0 rounded-3xl border border-white/5 bg-black/35 px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl md:px-5 xl:rounded-full">
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

        <div className="hidden min-w-0 items-center justify-end gap-2 lg:flex">
          <SearchForm
            value={query}
            onChange={setQuery}
            date={date}
            onDateChange={setDate}
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
            onSubmit={handleSearch}
          />
          <DesktopActions locationPath={location.pathname} onLogout={handleLogout} />
        </div>

        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/5 bg-[#1b2023] text-[#b9cbc1] transition hover:border-[#00ffc2]/30 hover:text-white lg:hidden"
          onClick={() => setIsOpen((current) => !current)}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {isOpen ? (
        <div className="mt-4 grid gap-2 border-t border-white/5 pt-4 lg:hidden">
          <SearchForm
            value={query}
            onChange={setQuery}
            date={date}
            onDateChange={setDate}
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
            onSubmit={handleSearch}
            mobile
          />
          <MobileLink to="/" active={isRecall} onClick={closeMenu}>
            Recall
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
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 items-center gap-3 rounded-2xl bg-[#1b2023]/70 px-4 py-3 text-sm font-bold text-[#b9cbc1] transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      ) : null}
    </nav>
  );
}

function SearchForm({
  value,
  onChange,
  date,
  onDateChange,
  selectedTags,
  onToggleTag,
  onSubmit,
  mobile = false,
}: {
  value: string;
  onChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  mobile?: boolean;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={[
        mobile
          ? 'grid gap-2 rounded-2xl bg-[#1b2023]/70 p-3'
          : 'grid min-w-0 grid-cols-[minmax(10rem,1fr)_auto_auto_auto] items-center gap-2',
      ].join(' ')}
      role="search"
    >
      <div className="flex min-h-9 min-w-0 items-center gap-2 rounded-full border border-white/5 bg-[#1b2023] px-3 py-1.5 text-[#b9cbc1] transition focus-within:border-[#00ffc2]/40 focus-within:text-white lg:w-[min(20vw,18rem)] lg:min-w-44">
        <Search className="h-4 w-4 shrink-0" />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search"
          className="min-w-0 flex-1 bg-transparent text-sm text-[#fbfffa] outline-none placeholder:text-[#b9cbc1]/50"
        />
      </div>

      <label className="flex min-h-9 min-w-0 items-center gap-2 rounded-full border border-white/5 bg-[#1b2023] px-3 py-1.5 text-xs font-medium text-[#b9cbc1] transition focus-within:border-[#00ffc2]/40 focus-within:text-white">
        <Calendar className="h-4 w-4 shrink-0" />
        <input
          type="date"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
          className="min-w-0 bg-transparent text-xs text-[#fbfffa] outline-none [color-scheme:dark]"
          aria-label="Search date"
        />
      </label>

      <TagPicker selectedTags={selectedTags} onToggleTag={onToggleTag} />

      <button
        type="submit"
        className="flex min-h-9 items-center justify-center rounded-full bg-[#00ffc2] px-4 py-1.5 text-xs font-bold text-[#101417] transition hover:bg-[#1affcb]"
      >
        Search
      </button>
    </form>
  );
}

function TagPicker({
  selectedTags,
  onToggleTag,
}: {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}) {
  return (
    <div className="group relative min-w-0">
      <button
        type="button"
        className="flex min-h-9 w-full items-center justify-center gap-2 rounded-full border border-white/5 bg-[#1b2023] px-3 py-1.5 text-xs font-medium text-[#b9cbc1] transition hover:border-[#00ffc2]/30 hover:text-white md:w-auto"
      >
        <Tag className="h-4 w-4 shrink-0" />
        <span>{selectedTags.length > 0 ? `${selectedTags.length} tags` : 'Tags'}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      <div className="hidden w-full rounded-2xl border border-white/5 bg-[#181c1f] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.35)] group-focus-within:grid group-hover:grid md:absolute md:right-0 md:z-30 md:mt-2 md:w-52">
        {TAG_OPTIONS.map((tag) => {
          const selected = selectedTags.includes(tag);

          return (
            <button
              key={tag}
              type="button"
              className={[
                'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition',
                selected
                  ? 'bg-[#00ffc2]/10 text-[#00ffc2]'
                  : 'text-[#b9cbc1] hover:bg-white/5 hover:text-white',
              ].join(' ')}
              onClick={() => onToggleTag(tag)}
            >
              <span>{tag}</span>
              {selected ? <Check className="h-4 w-4" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DesktopActions({
  locationPath,
  onLogout,
}: {
  locationPath: string;
  onLogout: () => void;
}) {
  return (
    <>
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

      <button
        type="button"
        onClick={onLogout}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/5 bg-[#1b2023] text-[#b9cbc1] transition hover:border-[#00ffc2]/30 hover:text-white"
        aria-label="Logout"
      >
        <LogOut className="h-4 w-4" />
      </button>
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
