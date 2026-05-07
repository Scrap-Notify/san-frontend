import { type FormEvent, useState } from 'react';

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
      className="flex min-h-14 min-w-0 items-center rounded-leaf border border-primary-signal bg-surface-low px-md py-sm transition focus-within:bg-surface-container focus-within:glow-neon sm:px-lg"
    >
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-leaf bg-transparent px-lg py-sm text-left text-body-sm text-text-primary outline-none placeholder:text-text-ghost sm:min-w-80"
      />
    </form>
  );
}
