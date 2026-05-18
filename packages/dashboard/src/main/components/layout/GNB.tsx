import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, X } from 'lucide-react';
import { authTokenStorage } from '@dashboard/api/client';
import { SearchBar } from '../search/SearchBar';
import githubSvg from '@ui/assets/icons/github.svg';
import sanLogoSvg from '@ui/assets/brand/SAN_LOGO.svg';
import sanTypoSvg from '@ui/assets/brand/SAN_TYPO.svg';

interface TopNavBarProps {
  activeMenu?: string;
  searchPlaceholder?: string;
  userAvatarUrl?: string;
  onSettingsClick?: () => void;
}

export function TopNavBar({
  searchPlaceholder = '키워드로 검색...',
  userAvatarUrl,
  activeMenu,
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
    navigate(params.toString() ? `/archive?${params.toString()}` : '/archive');
    setIsMenuOpen(false);
  };

  const handleUserClick = async () => {
    const token = await authTokenStorage.getToken();
    navigate(token ? '/profile' : '/login');
    setIsMenuOpen(false);
  };

  const handleGithubClick = () => {
    onSettingsClick?.();
    navigate('/settings/integrations');
    setIsMenuOpen(false);
  };

  const searchControl = (
    <SearchBar
      placeholder={searchPlaceholder}
      onSearch={handleSearch}
      className="w-full min-w-0 lg:w-[min(26vw,18rem)]"
    />
  );

  const actionControls = (
    <>
      <button
        onClick={handleGithubClick}
        aria-label="GitHub settings"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-secondary transition hover:bg-white/5 hover:text-white"
      >
        <img src={githubSvg} alt="" aria-hidden="true" className="h-[22px] w-[22px] opacity-70 transition hover:opacity-100" style={{ filter: 'invert(1)' }} />
      </button>

      <button
        onClick={handleUserClick}
        aria-label="User profile"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-secondary transition hover:bg-white/5 hover:text-white"
      >
        {userAvatarUrl && isAuthenticated ? (
          <img src={userAvatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          <User size={22} strokeWidth={1.5} />
        )}
      </button>
    </>
  );

  return (
    <header className="flex w-full items-center justify-between border-b border-primary-signal/10 bg-[#0B0D0F]/82 px-4 py-4 shadow-[0_14px_42px_rgba(0,0,0,0.34),0_0_32px_rgba(115,255,207,0.06)] backdrop-blur-2xl md:px-8">
      {/* Left side */}
      <div className="flex items-center gap-10">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 transition hover:opacity-80"
        >
          <img src={sanLogoSvg} alt="SAN Logo" className="h-[26px] w-[26px]" />
          <img src={sanTypoSvg} alt="SAN" className="h-[15px]" />
        </button>

        <div className="hidden items-center gap-8 lg:flex">
          <button
            onClick={() => navigate('/')}
            className={`text-[17px] font-medium tracking-wide transition hover:text-white ${activeMenu === 'Dashboard' ? 'text-primary-signal' : 'text-text-secondary'}`}
          >
            Home
          </button>
          <button
            onClick={() => navigate('/til')}
            className={`text-[17px] font-medium tracking-wide transition hover:text-white ${activeMenu === 'TIL' ? 'text-primary-signal' : 'text-text-secondary'}`}
          >
            TIL
          </button>
          <button
            onClick={() => navigate('/archive')}
            className={`text-[17px] font-medium tracking-wide transition hover:text-white ${activeMenu === 'Search' ? 'text-primary-signal' : 'text-text-secondary'}`}
          >
            Archive
          </button>
        </div>
      </div>

      {/* Right side Desktop */}
      <div className="ml-auto hidden min-w-0 items-center justify-end gap-6 lg:flex">
        {searchControl}
        <div className="flex shrink-0 items-center gap-4">
          {actionControls}
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="flex lg:hidden">
        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="p-2 text-text-secondary transition hover:text-white"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Content */}
      {isMenuOpen && (
        <div className="absolute left-0 top-full flex w-full flex-col gap-4 border-b border-primary-signal/10 bg-[#0B0D0F]/90 p-4 shadow-[0_18px_42px_rgba(0,0,0,0.34)] backdrop-blur-2xl lg:hidden">
          <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className={`text-left text-lg font-medium ${activeMenu === 'Dashboard' ? 'text-primary-signal' : 'text-text-secondary'}`}>Home</button>
          <button onClick={() => { navigate('/til'); setIsMenuOpen(false); }} className={`text-left text-lg font-medium ${activeMenu === 'TIL' ? 'text-primary-signal' : 'text-text-secondary'}`}>TIL</button>
          <button onClick={() => { navigate('/archive'); setIsMenuOpen(false); }} className={`text-left text-lg font-medium ${activeMenu === 'Search' ? 'text-primary-signal' : 'text-text-secondary'}`}>Archive</button>
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/5 pt-4">
            {searchControl}
            <div className="flex shrink-0 items-center gap-2">
              {actionControls}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
