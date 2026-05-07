import type { FormEvent } from 'react';
import { Search } from 'lucide-react';

interface KnowledgeSearchBarProps {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function KnowledgeSearchBar({
  value,
  disabled = false,
  onChange,
  onSubmit,
}: KnowledgeSearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form
      className="relative flex shrink-0 flex-col items-start self-stretch rounded-leaf border border-primary-signal/40"
      onSubmit={handleSubmit}
    >
      <div className="flex shrink-0 items-start justify-center self-stretch overflow-hidden rounded-leaf border border-primary-signal/50 bg-surface-highest px-12 py-4">
        <div className="relative flex grow flex-col items-start overflow-hidden pb-px">
          <input
            type="search"
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            placeholder="내 지식 아카이브에서 검색하기"
            className="w-full bg-transparent text-left text-body-main text-text-secondary outline-none placeholder:text-text-secondary disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>
      <div className="absolute left-4 top-0 flex h-[50px] shrink-0 items-center justify-start">
        <Search size={18} className="text-text-secondary" aria-hidden="true" />
      </div>
    </form>
  );
}
