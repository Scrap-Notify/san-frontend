import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, X } from 'lucide-react';
import { authTokenStorage } from '../../api/client';
import { SearchBar } from './SearchBar';
import githubSvg from '@dashboard/assets/github.svg';
import sanLogoSvg from '../../../../ui/src/assets/brand/SAN_LOGO.svg';
import sanTypoSvg from '../../../../ui/src/assets/brand/SAN_TYPO.svg';

interface TopNavBarProps {
  activeMenu?: string;
  searchPlaceholder?: string;
  userAvatarUrl?: string;
  onSettingsClick?: () => void;
}

export function TopNavBar({
  searchPlaceholder = 'Search the archive...',
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
    navigate('/settings/integrations');
    setIsMenuOpen(false);
  };

  const navActions = (
    <>
      <SearchBar placeholder={searchPlaceholder} onSearch={handleSearch} />

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
    <header className="flex w-full items-center justify-between border-b border-white/5 bg-[#0B0D0F] px-4 py-4 md:px-8">
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
            className={`text-[17px] font-medium tracking-wide transition hover:text-white ${activeMenu === 'Archive' ? 'text-primary-signal' : 'text-text-secondary'}`}
          >
            Archive
          </button>
        </div>
      </div>

      {/* Right side Desktop */}
      <div className="hidden items-center gap-5 lg:flex">
        {navActions}
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
        <div className="absolute left-0 top-full flex w-full flex-col gap-4 border-b border-white/5 bg-[#0B0D0F] p-4 lg:hidden">
          <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className={`text-left text-lg font-medium ${activeMenu === 'Dashboard' ? 'text-primary-signal' : 'text-text-secondary'}`}>Home</button>
          <button onClick={() => { navigate('/til'); setIsMenuOpen(false); }} className={`text-left text-lg font-medium ${activeMenu === 'TIL' ? 'text-primary-signal' : 'text-text-secondary'}`}>TIL</button>
          <button onClick={() => { navigate('/archive'); setIsMenuOpen(false); }} className={`text-left text-lg font-medium ${activeMenu === 'Archive' ? 'text-primary-signal' : 'text-text-secondary'}`}>Archive</button>
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
            {navActions}
          </div>
        </div>
      )}
    </header>
  );
}
