import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authTokenStorage } from '../api/client';
import { SearchBar } from './SearchBar';

interface TopNavBarProps {
  activeMenu?: string;
  searchPlaceholder?: string;
  userAvatarUrl?: string;
  onSettingsClick?: () => void;
}

export function TopNavBar({
  activeMenu = 'Recall',
  searchPlaceholder = 'Search knowledge cards...',
  userAvatarUrl,
  onSettingsClick,
}: TopNavBarProps) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    const refreshAuthState = async () => {
      const token = await authTokenStorage.getToken();
      if (!ignore) {
        setIsAuthenticated(Boolean(token));
      }
    };

    void refreshAuthState();

    const handleStorageChange = () => {
      void refreshAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      ignore = true;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSearch = (keyword: string) => {
    const params = new URLSearchParams();
    if (keyword) {
      params.set('query', keyword);
    }
    navigate(params.toString() ? `/result?${params.toString()}` : '/result');
    setIsMenuOpen(false);
  };

  const handleUserClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    setIsMenuOpen(false);
  };

  const handleGithubClick = () => {
    onSettingsClick?.();
    setIsMenuOpen(false);
  };

  const navActions = (
    <>
      <SearchBar placeholder={searchPlaceholder} onSearch={handleSearch} />

      <IconButton ariaLabel="GitHub settings" tooltip="깃허브 연동하기" onClick={handleGithubClick}>
        <GithubIcon />
      </IconButton>

      <UserButton
        src={userAvatarUrl}
        isAuthenticated={isAuthenticated}
        onClick={handleUserClick}
      />
    </>
  );

  return (
    <header className="flex w-full flex-col gap-5 rounded-tr-[48px] rounded-bl-[48px] bg-[#101417]/60 px-6 pb-5 pt-6 text-[#fbfffa] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-8">
      <div className="flex min-w-0 items-center justify-between gap-4 lg:shrink-0">
        <div className="flex min-w-0 items-center gap-10">
          <h1 className="shrink-0 text-2xl font-bold leading-none sm:text-3xl">SAN</h1>

          <div className="min-w-0 border-b-2 border-[#00ffc2] pb-2">
            <span className="block truncate pl-2 text-xl font-semibold leading-none text-[#00ffc2] sm:text-2xl">
              {activeMenu}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#181c1f] text-[#b9cbc1] transition hover:border-[#00ffc2]/40 hover:text-[#00ffc2] lg:hidden"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <div className="hidden min-w-0 gap-3 lg:grid lg:w-[min(60vw,54rem)] lg:grid-cols-[minmax(16rem,1fr)_auto_auto] lg:items-center">
        {navActions}
      </div>

      {isMenuOpen ? (
        <div className="grid min-w-0 gap-3 border-t border-white/5 pt-5 lg:hidden">
          {navActions}
        </div>
      ) : null}
    </header>
  );
}

interface IconButtonProps {
  children: ReactNode;
  ariaLabel: string;
  tooltip?: string;
  onClick?: () => void;
}

function IconButton({ children, ariaLabel, tooltip, onClick }: IconButtonProps) {
  return (
    <div className="group grid justify-items-center lg:relative">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/5 bg-[#181c1f] text-[#b9cbc1] transition hover:border-[#00ffc2]/40 hover:text-[#00ffc2]"
      >
        {children}
      </button>
      {tooltip ? (
        <span className="mt-2 hidden whitespace-nowrap rounded-full border border-[#00ffc2]/50 bg-[#181c1f]/95 px-4 py-2 text-sm font-bold text-[#00ffc2] shadow-[0_12px_30px_rgba(0,0,0,0.45)] group-hover:inline-flex lg:absolute lg:top-full">
          {tooltip}
        </span>
      ) : null}
    </div>
  );
}

function UserButton({
  src,
  isAuthenticated,
  onClick,
}: {
  src?: string;
  isAuthenticated: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border transition',
        isAuthenticated
          ? 'border-[#00ffc2]/60 bg-[#00ffc2]/15 text-[#00ffc2] shadow-[0_0_24px_rgba(0,255,194,0.16)] hover:bg-[#00ffc2]/20'
          : 'border-white/10 bg-[#1b2023] text-[#83958c] hover:border-[#83958c]/60 hover:text-[#b9cbc1]',
      ].join(' ')}
      aria-label={isAuthenticated ? 'User profile' : 'Go to login'}
      title={isAuthenticated ? 'User profile' : 'Login'}
    >
      {src && isAuthenticated ? (
        <span className="grid h-full w-full place-items-center">
          <img src={src} alt="" className="col-start-1 row-start-1 h-full w-full object-cover opacity-45" />
          <span className="col-start-1 row-start-1">
            <UserIcon />
          </span>
        </span>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <UserIcon />
        </div>
      )}
    </button>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
      <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
      <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="shrink-0" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.59 2 12.253c0 4.52 2.865 8.354 6.839 9.708.5.095.682-.222.682-.494 0-.244-.009-.889-.014-1.744-2.782.619-3.369-1.375-3.369-1.375-.455-1.184-1.11-1.5-1.11-1.5-.908-.636.069-.623.069-.623 1.004.072 1.532 1.057 1.532 1.057.892 1.566 2.341 1.114 2.91.852.091-.662.349-1.114.635-1.37-2.221-.259-4.556-1.139-4.556-5.067 0-1.12.39-2.034 1.03-2.75-.103-.26-.446-1.303.098-2.714 0 0 .84-.276 2.75 1.05A9.376 9.376 0 0 1 12 6.938c.85.004 1.705.118 2.504.347 1.909-1.326 2.747-1.05 2.747-1.05.546 1.411.203 2.455.1 2.714.64.716 1.028 1.63 1.028 2.75 0 3.938-2.339 4.805-4.567 5.059.359.316.678.94.678 1.895 0 1.368-.012 2.472-.012 2.807 0 .274.18.594.688.493C19.138 20.604 22 16.771 22 12.253 22 6.59 17.523 2 12 2Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
      <path
        d="M12 12C14.4853 12 16.5 9.98528 16.5 7.5C16.5 5.01472 14.4853 3 12 3C9.51472 3 7.5 5.01472 7.5 7.5C7.5 9.98528 9.51472 12 12 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4 21C4.75 17.15 7.68 15 12 15C16.32 15 19.25 17.15 20 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
