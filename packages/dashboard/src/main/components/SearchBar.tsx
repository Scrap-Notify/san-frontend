import { type FormEvent, useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  onSearch: (keyword: string) => void;
}

export function SearchBar({
  defaultValue = '',
  placeholder = 'Search knowledge cards...',
  onSearch,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="inline-flex min-h-14 w-fit max-w-full min-w-0 items-center gap-4 rounded-[999px] border border-primary-signal bg-surface-low px-8 py-sm transition focus-within:bg-surface-container focus-within:glow-neon"
    >
      <div className="flex min-h-14 min-w-0 items-center gap-4">
        <Search size={20} aria-hidden="true" className="shrink-0 text-primary-signal" />
        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="h-full flex-1 rounded-[999px] bg-transparent px-0 text-left text-body-sm leading-none text-text-primary caret-primary-signal outline-none placeholder:text-text-ghost focus:outline-none focus:ring-0 sm:min-w-80 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        />
        {value ? (
          <button
            type="button"
            onClick={() => setValue('')}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-text-secondary transition hover:text-primary-signal"
            aria-label="Clear search"
          >
            <X size={20} />
          </button>
        ) : (
          <X
            size={20}
            aria-hidden="true"
            className="pointer-events-none shrink-0 text-text-secondary/40"
          />
        )}
      </div>
    </form>
  );
}
