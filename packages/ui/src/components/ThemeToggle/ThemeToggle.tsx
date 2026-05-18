import { MoonStar, SunMedium } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getResolvedTheme, toggleTheme, type ThemeMode } from '../../theme/theme';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode>(() => getResolvedTheme());

  useEffect(() => {
    const handleStorage = () => {
      setTheme(getResolvedTheme());
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleToggle = () => {
    const next = toggleTheme();
    setTheme(next);
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={[
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-text-secondary/10 bg-surface-low text-text-secondary transition',
        'hover:border-action-accent/40 hover:text-white',
        className ?? '',
      ].join(' ')}
    >
      {isDark ? <SunMedium size={18} strokeWidth={1.8} /> : <MoonStar size={18} strokeWidth={1.8} />}
    </button>
  );
}
