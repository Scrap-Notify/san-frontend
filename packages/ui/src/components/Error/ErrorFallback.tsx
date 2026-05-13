export type ErrorFallbackType = 'default' | 'network' | 'notFound' | 'server' | 'auth';

export interface ErrorFallbackProps {
  message?: string;
  description?: string;
  onRetry?: () => void;
  variant?: 'full' | 'inline';
  type?: ErrorFallbackType;
}

const ERROR_PRESET: Record<ErrorFallbackType, { message: string; description: string }> = {
  default: {
    message: '문제가 발생했어요',
    description: '잠시 후 다시 시도해 주세요.',
  },
  network: {
    message: '네트워크 연결을 확인해 주세요',
    description: '인터넷 연결이 불안정하거나 서버에 연결할 수 없습니다.',
  },
  notFound: {
    message: '요청한 내용을 찾을 수 없어요',
    description: '삭제되었거나 접근할 수 없는 항목일 수 있습니다.',
  },
  server: {
    message: '서버에서 문제가 발생했어요',
    description: '잠시 후 다시 시도해 주세요.',
  },
  auth: {
    message: '로그인이 필요해요',
    description: '계속하려면 다시 로그인해 주세요.',
  },
};

function ErrorIcon({ type }: { type: ErrorFallbackType }) {
  if (type === 'network') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M1 6s4-4 11-4 11 4 11 4M5 10s2.5-2.5 7-2.5 7 2.5 7 2.5M9 14s1.5-1.5 3-1.5 3 1.5 3 1.5M12 18h.01"
          stroke="#00ffc2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <line x1="2" y1="2" x2="22" y2="22" stroke="#ff4d4d" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    );
  }

  if (type === 'notFound') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="8" stroke="#00ffc2" strokeWidth="1.5" />
        <path d="m21 21-4.35-4.35" stroke="#00ffc2" strokeLinecap="round" strokeWidth="1.5" />
        <path d="M11 8v3M11 14h.01" stroke="#83958c" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    );
  }

  if (type === 'auth') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="#00ffc2" strokeWidth="1.5" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#00ffc2" strokeLinecap="round" strokeWidth="1.5" />
        <circle cx="12" cy="16" r="1" fill="#83958c" />
      </svg>
    );
  }

  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        stroke="#00ffc2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path d="M12 9v4M12 17h.01" stroke="#83958c" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function RetryIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 12a9 9 0 0 1 15.74-6.26L21 8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M21 3v5h-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path
        d="M21 12a9 9 0 0 1-15.74 6.26L3 16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function ErrorFallback({
  message,
  description,
  onRetry,
  variant = 'inline',
  type = 'default',
}: ErrorFallbackProps) {
  const preset = ERROR_PRESET[type];
  const displayMessage = message ?? preset.message;
  const displayDescription = description ?? preset.description;

  if (variant === 'full') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#101417] px-8">
        <div className="flex max-w-sm flex-col items-center gap-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-leaf border border-[#1e5056]/30 bg-[#1e5056]/20 shadow-[0_0_30px_rgba(0,255,194,0.05)]">
            <ErrorIcon type={type} />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-black text-[#fbfffa]">{displayMessage}</h2>
            <p className="text-sm leading-relaxed text-[#83958c]">{displayDescription}</p>
          </div>

          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-2 rounded-full border border-[#00ffc2]/30 bg-[#00ffc2]/10 px-6 py-2.5 text-sm font-semibold text-[#00ffc2] transition-all duration-200 hover:bg-[#00ffc2]/20"
            >
              <RetryIcon size={14} />
              다시 시도
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-leaf border border-[#1e5056]/20 bg-[#181c1f]/60 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#1e5056]/30 bg-[#1e5056]/20">
        <ErrorIcon type={type} />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-[#fbfffa]">{displayMessage}</p>
        <p className="text-xs text-[#83958c]">{displayDescription}</p>
      </div>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-full border border-[#00ffc2]/20 bg-[#00ffc2]/10 px-4 py-2 text-xs font-medium text-[#00ffc2] transition-all duration-200 hover:bg-[#00ffc2]/20"
        >
          <RetryIcon size={12} />
          다시 시도
        </button>
      ) : null}
    </div>
  );
}
