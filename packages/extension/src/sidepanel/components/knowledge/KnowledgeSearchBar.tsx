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
    <form className="relative flex shrink-0 self-stretch" onSubmit={handleSubmit}>
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary-signal"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="지식 아카이브 검색"
        className="w-full rounded-leaf border border-primary-signal/40 bg-surface-highest py-4 pl-12 pr-4 text-left text-body-main text-text-primary outline-none transition placeholder:text-text-secondary focus:border-primary-signal focus:shadow-neon disabled:cursor-not-allowed disabled:opacity-60"
      />
    </form>
  );
}
