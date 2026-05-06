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
    <header className="flex min-h-16 items-center justify-between gap-6 bg-[#101417]/50 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-8">
        <h1 className="shrink-0 text-[28px] font-bold leading-none text-[#fbfffa]">
          TIL Workspace
        </h1>

        <TILModeTabs activeTab={activeTab} onChange={onTabChange} />
      </div>

      <div className="flex shrink-0 items-center gap-4 rounded-2xl border-l border-t border-[#fbfffa]/5 bg-[#181c1f]/50 p-2 backdrop-blur-xl">
        <div className="flex items-center gap-3 rounded-[48px] bg-[#1c2023] px-6 py-2 text-sm font-medium text-[#fbfffa]">
          <Calendar size={18} className="text-[#00ffc2]" />
          {dateLabel}
        </div>

        <label className="relative block">
          <SlidersHorizontal
            size={14}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#b9cbc1]"
          />
          <input
            type="search"
            placeholder="키워드로 검색..."
            onChange={(event) => onSearch?.(event.target.value)}
            className="h-11 w-[240px] rounded-[48px] bg-[#0b0f12]/50 pl-12 pr-4 text-sm font-medium text-[#e0e3e7] outline-none placeholder:text-gray-500 focus:ring-1 focus:ring-[#00ffc2]/40"
          />
        </label>
      </div>
    </header>
  );
}