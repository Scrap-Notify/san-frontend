import type { ReactNode } from 'react';

interface TopNavBarProps {
  activeMenu?: string;
  dateRangeLabel?: string;
  userAvatarUrl?: string;
  onDateRangeClick?: () => void;
  onCreateTil?: () => void;
  onSettingsClick?: () => void;
}

export function TopNavBar({
  activeMenu = 'Recall',
  dateRangeLabel = 'Select date range...',
  userAvatarUrl,
  onDateRangeClick,
  onCreateTil,
  onSettingsClick,
}: TopNavBarProps) {
  return (
    <header className="flex w-full flex-col gap-5 rounded-tr-[48px] rounded-bl-[48px] bg-[#101417]/60 px-6 pb-5 pt-6 text-[#fbfffa] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div className="flex min-w-0 flex-wrap items-center gap-x-10 gap-y-3">
        <h1 className="shrink-0 text-2xl font-bold leading-none sm:text-3xl">SAN</h1>

        <div className="min-w-0 border-b-2 border-[#00ffc2] pb-2">
          <span className="block truncate text-xl font-semibold leading-none text-[#00ffc2] sm:text-2xl">
            {activeMenu}
          </span>
        </div>
      </div>

      <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(18rem,1fr)_auto_auto_auto] md:items-center lg:max-w-[min(62vw,56rem)]">
        <DateRangeButton onClick={onDateRangeClick}>
          {dateRangeLabel}
        </DateRangeButton>

        <button
          type="button"
          onClick={onCreateTil}
          className="flex min-h-12 shrink-0 items-center justify-center rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px] bg-[#00ffc2] px-8 py-3 text-sm font-bold text-[#007255] transition hover:opacity-95 active:translate-y-px"
        >
          TIL (+)
        </button>

        <IconButton ariaLabel="GitHub settings" onClick={onSettingsClick}>
          <GithubIcon />
        </IconButton>

        <Avatar src={userAvatarUrl} />
      </div>
    </header>
  );
}

interface DateRangeButtonProps {
  children: ReactNode;
  onClick?: () => void;
}

function DateRangeButton({ children, onClick }: DateRangeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-12 min-w-0 items-center gap-3 rounded-full bg-[#181c1f] px-4 py-2 transition hover:bg-[#20262a]"
    >
      <CalendarIcon />

      <span className="min-w-0 flex-1 truncate rounded-[20px] border border-[#00ffc2] px-4 py-2.5 text-left text-sm font-medium text-[#83958c] sm:min-w-72">
        {children}
      </span>
    </button>
  );
}

interface IconButtonProps {
  children: ReactNode;
  ariaLabel: string;
  onClick?: () => void;
}

function IconButton({ children, ariaLabel, onClick }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/5 bg-[#181c1f] text-[#b9cbc1] transition hover:border-[#00ffc2]/40 hover:text-[#00ffc2]"
    >
      {children}
    </button>
  );
}

function Avatar({ src }: { src?: string }) {
  return (
    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#3a4a43]/30 bg-[#181c1f]">
      {src ? (
        <img
          src={src}
          alt="User profile"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#b9cbc1]">
          ME
        </div>
      )}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 11 12" fill="none" className="shrink-0">
      <path
        d="M1.16667 11.6667C0.845833 11.6667 0.571181 11.5524 0.342708 11.324C0.114236 11.0955 0 10.8208 0 10.5V2.33333C0 2.0125 0.114236 1.73785 0.342708 1.50937C0.571181 1.2809 0.845833 1.16667 1.16667 1.16667H1.75V0H2.91667V1.16667H7.58333V0H8.75V1.16667H9.33333C9.65417 1.16667 9.92882 1.2809 10.1573 1.50937C10.3858 1.73785 10.5 2.0125 10.5 2.33333V10.5C10.5 10.8208 10.3858 11.0955 10.1573 11.324C9.92882 11.5524 9.65417 11.6667 9.33333 11.6667H1.16667ZM1.16667 10.5H9.33333V4.66667H1.16667V10.5ZM1.16667 3.5H9.33333V2.33333H1.16667V3.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="shrink-0" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.59 2 12.253c0 4.52 2.865 8.354 6.839 9.708.5.095.682-.222.682-.494 0-.244-.009-.889-.014-1.744-2.782.619-3.369-1.375-3.369-1.375-.455-1.184-1.11-1.5-1.11-1.5-.908-.636.069-.623.069-.623 1.004.072 1.532 1.057 1.532 1.057.892 1.566 2.341 1.114 2.91.852.091-.662.349-1.114.635-1.37-2.221-.259-4.556-1.139-4.556-5.067 0-1.12.39-2.034 1.03-2.75-.103-.26-.446-1.303.098-2.714 0 0 .84-.276 2.75 1.05A9.376 9.376 0 0 1 12 6.938c.85.004 1.705.118 2.504.347 1.909-1.326 2.747-1.05 2.747-1.05.546 1.411.203 2.455.1 2.714.64.716 1.028 1.63 1.028 2.75 0 3.938-2.339 4.805-4.567 5.059.359.316.678.94.678 1.895 0 1.368-.012 2.472-.012 2.807 0 .274.18.594.688.493C19.138 20.604 22 16.771 22 12.253 22 6.59 17.523 2 12 2Z" />
    </svg>
  );
}
