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
      className="flex min-h-14 min-w-0 items-center rounded-full border border-[#00ffc2] bg-[#181c1f] px-5 py-3 transition focus-within:bg-[#20262a] sm:px-6"
    >
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-[20px] bg-transparent px-6 py-3.5 text-left text-sm font-medium text-[#fbfffa] outline-none placeholder:text-[#83958c] sm:min-w-80"
      />
    </form>
  );
}
