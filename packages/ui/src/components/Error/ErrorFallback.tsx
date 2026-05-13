import { AlertTriangle, LockKeyhole, RotateCcw, SearchX, WifiOff } from 'lucide-react';

export type ErrorFallbackType = 'default' | 'network' | 'notFound' | 'server' | 'auth';
export type ErrorFallbackVariant = 'full' | 'inline';

export interface ErrorFallbackProps {
  type?: ErrorFallbackType;
  variant?: ErrorFallbackVariant;
  message?: string;
  description?: string;
  onRetry?: () => void;
}

const ERROR_PRESET: Record<ErrorFallbackType, { message: string; description: string }> = {
  default: {
    message: '문제가 발생했어요',
    description: '잠시 후 다시 시도해주세요.',
  },
  network: {
    message: '인터넷 연결을 확인해주세요',
    description: '네트워크 상태를 확인하고 다시 시도해주세요.',
  },
  notFound: {
    message: '페이지를 찾을 수 없어요',
    description: '주소가 올바른지 확인하거나 홈으로 돌아가주세요.',
  },
  server: {
    message: '서버 오류가 발생했어요',
    description: '잠시 후 다시 시도해주세요.',
  },
  auth: {
    message: '로그인이 필요해요',
    description: '계속하려면 로그인 후 다시 시도해주세요.',
  },
};

function ErrorIcon({ type, size }: { type: ErrorFallbackType; size: number }) {
  const iconProps = {
    size,
    strokeWidth: 1.8,
    'aria-hidden': true,
  };

  if (type === 'network') {
    return <WifiOff {...iconProps} />;
  }

  if (type === 'notFound') {
    return <SearchX {...iconProps} />;
  }

  if (type === 'auth') {
    return <LockKeyhole {...iconProps} />;
  }

  return <AlertTriangle {...iconProps} />;
}

export function ErrorFallback({
  type = 'default',
  variant = 'inline',
  message,
  description,
  onRetry,
}: ErrorFallbackProps) {
  const preset = ERROR_PRESET[type];
  const displayMessage = message ?? preset.message;
  const displayDescription = description ?? preset.description;
  const isFull = variant === 'full';

  return (
    <section
      role="alert"
      className={[
        'flex flex-col items-center justify-center text-center',
        'rounded-tl-[32px] rounded-br-[32px] rounded-tr-lg rounded-bl-lg',
        'border border-white/5 bg-surface-low',
        isFull ? 'min-h-[400px] w-full gap-5 px-8 py-16' : 'min-h-[280px] w-full gap-4 px-6 py-10',
      ].join(' ')}
    >
      <div
        className={[
          'flex items-center justify-center',
          'rounded-tl-[32px] rounded-br-[32px] rounded-tr-lg rounded-bl-lg',
          'border border-primary-signal/20 bg-misty-teal/30 text-primary-signal',
          isFull ? 'h-20 w-20' : 'h-14 w-14',
        ].join(' ')}
      >
        <ErrorIcon type={type} size={isFull ? 34 : 24} />
      </div>

      <div className="flex max-w-md flex-col items-center gap-2">
        <h2 className={isFull ? 'text-h2-bold text-text-primary' : 'text-body-main-bold text-text-primary'}>
          {displayMessage}
        </h2>
        <p className={isFull ? 'text-body-main text-text-secondary' : 'text-body-sm text-text-secondary'}>
          {displayDescription}
        </p>
      </div>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className={[
            'inline-flex items-center justify-center gap-2',
            'rounded-full border border-primary-signal/20 bg-primary-signal/10',
            'font-semibold text-primary-signal transition hover:bg-primary-signal/15',
            isFull ? 'min-h-11 px-6 text-body-sm-bold' : 'min-h-9 px-4 text-caption-bold',
          ].join(' ')}
        >
          <RotateCcw size={isFull ? 16 : 13} aria-hidden="true" />
          다시 시도
        </button>
      ) : null}
    </section>
  );
}
