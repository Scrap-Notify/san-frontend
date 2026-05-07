import { Calendar, SlidersHorizontal } from 'lucide-react';
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
    <header className="flex min-h-16 items-center justify-between gap-dashboard-gap bg-background/50 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-dashboard-gap">
        <h1 className="shrink-0 text-h2-bold leading-none text-text-primary">
          TIL Workspace
        </h1>

        <TILModeTabs activeTab={activeTab} onChange={onTabChange} />
      </div>

      <div className="flex shrink-0 items-center gap-md rounded-leaf border border-text-primary/5 bg-surface-low/50 p-sm backdrop-blur-xl">
        <div className="flex items-center gap-sm rounded-leaf bg-surface-container px-lg py-sm text-body-sm-bold text-text-primary">
          <Calendar size={20} className="text-primary-signal" />
          {dateLabel}
        </div>

        <label className="relative block">
          <SlidersHorizontal
            size={20}
            className="pointer-events-none absolute left-md top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            type="search"
            placeholder="키워드로 검색..."
            onChange={(event) => onSearch?.(event.target.value)}
            className="h-11 w-60 rounded-leaf bg-background/50 pl-12 pr-md text-body-sm text-text-primary outline-none placeholder:text-text-ghost focus:ring-1 focus:ring-primary-signal/40"
          />
        </label>
      </div>
    </header>
  );
}
