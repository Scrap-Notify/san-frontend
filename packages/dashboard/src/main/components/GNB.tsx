import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, X } from 'lucide-react';
import { authTokenStorage } from '@dashboard/api/client';
import { SearchBar } from './SearchBar';
import githubSvg from '@dashboard/assets/github.svg';

interface TopNavBarProps {
  activeMenu?: string;
  searchPlaceholder?: string;
  userAvatarUrl?: string;
  onSettingsClick?: () => void;
}

export function TopNavBar({
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

  const handleTilClick = () => {
    navigate('/til');
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
    navigate('/settings/integrations');
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
    <header className="flex w-full flex-col gap-dashboard-gap rounded-leaf bg-background/60 px-lg py-lg text-text-primary backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between lg:px-xl">
      <div className="flex min-w-0 items-center justify-between gap-md lg:shrink-0">
        <div className="flex min-w-0 items-center gap-md sm:gap-dashboard-gap">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="shrink-0 text-h1-bold leading-none transition hover:text-primary-signal"
          >
            SAN
          </button>

          <button
            type="button"
            onClick={handleTilClick}
            className="shrink-0 border-b border-primary-signal text-body-lg-bold text-primary-signal transition hover:glow-neon"
          >
            TIL
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-leaf border border-text-primary/10 bg-surface-low text-text-secondary transition hover:border-primary-signal/40 hover:text-primary-signal hover:glow-neon lg:hidden"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="hidden min-w-0 justify-end lg:flex lg:flex-1">
        <div className="flex min-w-0 items-center gap-dashboard-gap">
          {navActions}
        </div>
      </div>

      {isMenuOpen ? (
        <div className="grid min-w-0 gap-dashboard-gap border-t border-text-primary/5 pt-lg lg:hidden">
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
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary-signal/20 bg-primary-signal transition hover:glow-neon"
      >
        {children}
      </button>
      {tooltip ? (
        <span className="mt-sm hidden whitespace-nowrap rounded-leaf border border-primary-signal/50 bg-surface-low/95 px-md py-sm text-body-sm-bold text-primary-signal shadow-neon-sm group-hover:inline-flex lg:absolute lg:top-full">
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
        'flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border transition hover:glow-neon',
        isAuthenticated
          ? 'border-primary-signal/60 bg-primary-signal/15 text-primary-signal shadow-neon-sm hover:bg-primary-signal/20'
          : 'border-text-primary/10 bg-surface-container text-text-ghost hover:border-text-ghost/60 hover:text-text-secondary',
      ].join(' ')}
      aria-label={isAuthenticated ? 'User profile' : 'Go to login'}
      title={isAuthenticated ? 'User profile' : 'Login'}
    >
      {src && isAuthenticated ? (
        <span className="grid h-full w-full place-items-center">
          <img src={src} alt="" className="col-start-1 row-start-1 h-full w-full object-cover opacity-45" />
          <span className="col-start-1 row-start-1">
            <User size={20} />
          </span>
        </span>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <User size={20} />
        </div>
      )}
    </button>
  );
}

function GithubIcon() {
  return <img src={githubSvg} alt="" aria-hidden="true" className="h-7 w-7" />;
}
