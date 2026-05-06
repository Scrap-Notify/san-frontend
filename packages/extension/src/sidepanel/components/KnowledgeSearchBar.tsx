import type { FormEvent } from 'react';

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
      className="relative flex shrink-0 flex-col items-start self-stretch rounded-3xl border border-[#00ffc2]/40"
      onSubmit={handleSubmit}
    >
      <div className="flex shrink-0 items-start justify-center self-stretch overflow-hidden rounded-2xl border border-[#00ffc2]/50 bg-[#0b0f12] px-12 py-4">
        <div className="relative flex grow flex-col items-start overflow-hidden pb-px">
          <input
            type="search"
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            placeholder="내 지식 아카이브에서 검색하기"
            className="w-full bg-transparent text-left text-sm text-[#b9cbc1] outline-none placeholder:text-[#b9cbc1] disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>
      <div className="absolute left-4 top-0 flex h-[50px] shrink-0 items-center justify-start">
        <SearchIcon />
      </div>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.14583 12.3708 1.8875 11.1125C0.629167 9.85417 0 8.31667 0 6.5C0 4.68333 0.629167 3.14583 1.8875 1.8875C3.14583 0.629167 4.68333 0 6.5 0C8.31667 0 9.85417 0.629167 11.1125 1.8875C12.3708 3.14583 13 4.68333 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18ZM6.5 11C7.75 11 8.8125 10.5625 9.6875 9.6875C10.5625 8.8125 11 7.75 11 6.5C11 5.25 10.5625 4.1875 9.6875 3.3125C8.8125 2.4375 7.75 2 6.5 2C5.25 2 4.1875 2.4375 3.3125 3.3125C2.4375 4.1875 2 5.25 2 6.5C2 7.75 2.4375 8.8125 3.3125 9.6875C4.1875 10.5625 5.25 11 6.5 11Z"
        fill="#B9CBC1"
      />
    </svg>
  );
}
