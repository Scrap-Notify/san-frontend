import { Calendar, Search } from 'lucide-react';
import { TILModeTabs, type TILMode } from './TILModeTabs';

interface TILWorkspaceHeaderProps {
  activeTab: TILMode;
  dateLabel: string;
  onTabChange?: (tab: TILMode) => void;
  onSearch?: (value: string) => void;
}

export function TILWorkspaceHeader({
  activeTab,
  dateLabel,
  onTabChange,
  onSearch,
}: TILWorkspaceHeaderProps) {
  return (
    <header className="grid min-h-16 w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-dashboard-gap bg-background/50 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-dashboard-gap">
        <h1 className="shrink-0 text-h2-bold leading-none text-text-primary">
          TIL Workspace
        </h1>

        <TILModeTabs activeTab={activeTab} onChange={onTabChange} />
      </div>

      <div className="flex min-w-fit items-center justify-center gap-sm rounded-[8px] border border-text-primary/5 bg-background/80 px-lg py-sm text-body-sm-bold text-text-primary backdrop-blur-xl">
        <Calendar size={20} className="text-primary-signal" />
        {dateLabel}
      </div>

      <label className="ml-auto flex h-11 w-full max-w-80 min-w-0 items-center gap-md rounded-[8px] bg-background/80 px-md focus-within:ring-1 focus-within:ring-primary-signal/40">
        <Search
          size={20}
          className="shrink-0 text-text-secondary"
        />
        <input
          type="search"
          placeholder="키워드로 검색..."
          onChange={(event) => onSearch?.(event.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent text-body-sm text-text-primary outline-none placeholder:text-text-ghost"
        />
      </label>
    </header>
  );
}
