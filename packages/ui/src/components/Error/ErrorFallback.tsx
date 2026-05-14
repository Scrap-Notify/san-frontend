import { AlertTriangle, LockKeyhole, RotateCcw, SearchX, WifiOff } from 'lucide-react';

export type ErrorFallbackType = 'default' | 'network' | 'notFound' | 'server' | 'auth';
export type ErrorFallbackVariant = 'full' | 'inline';

export interface ErrorFallbackProps {
  type?: ErrorFallbackType;
  variant?: ErrorFallbackVariant;
  message?: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
}

const ERROR_PRESET: Record<ErrorFallbackType, { message: string; description: string; actionLabel: string }> = {
  default: {
    message: '문제가 발생했어요',
    description: '잠시 후 다시 시도해주세요.',
    actionLabel: '다시 시도',
  },
  network: {
    message: '인터넷 연결을 확인해주세요',
    description: '네트워크 상태를 확인하고 다시 시도해주세요.',
    actionLabel: '다시 시도',
  },
  notFound: {
    message: '페이지를 찾을 수 없어요',
    description: '주소가 올바른지 확인하거나 홈으로 돌아가주세요.',
    actionLabel: '돌아가기',
  },
  server: {
    message: '서버 오류가 발생했어요',
    description: '잠시 후 다시 시도해주세요.',
    actionLabel: '다시 시도',
  },
  auth: {
    message: '로그인이 필요해요',
    description: '해당 페이지는 로그인 후 이용할 수 있어요.',
    actionLabel: '로그인하기',
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
  actionLabel,
  onRetry,
}: ErrorFallbackProps) {
  const preset = ERROR_PRESET[type];
  const displayMessage = message ?? preset.message;
  const displayDescription = description ?? preset.description;
  const displayActionLabel = actionLabel ?? preset.actionLabel;
  const isFull = variant === 'full';

  return (
    <section
      role="alert"
      className={[
        'relative mx-auto flex w-full max-w-[440px] flex-col items-center justify-center overflow-hidden text-center',
        'rounded-tl-[48px] rounded-br-[48px] rounded-tr-lg rounded-bl-lg',
        'border border-primary-signal/5 bg-surface-low',
        'shadow-[0_0_20px_0_rgba(0,255,194,0.12)]',
        isFull ? 'min-h-[400px] gap-4 px-10 py-16' : 'min-h-[280px] gap-4 px-6 py-10',
      ].join(' ')}
    >
      <div
        className={[
          'flex items-center justify-center text-primary-signal',
          'rounded-tl-[48px] rounded-br-[48px] rounded-tr-lg rounded-bl-lg',
          'border border-teal/30 bg-teal/20',
          isFull ? 'h-20 w-20' : 'h-14 w-14',
        ].join(' ')}
      >
        <ErrorIcon type={type} size={isFull ? 34 : 24} />
      </div>

      <div className="flex max-w-[22rem] flex-col items-center gap-2">
        <h2 className={isFull ? 'text-h2-bold text-text-primary' : 'text-body-main-bold text-text-primary'}>
          {displayMessage}
        </h2>
        <p className={isFull ? 'text-body-main text-text-ghost' : 'text-body-sm text-text-ghost'}>
          {displayDescription}
        </p>
      </div>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className={[
            'inline-flex items-center justify-center gap-2 rounded-full',
            'bg-primary-signal/10 font-semibold text-primary-signal transition hover:bg-primary-signal/15',
            isFull ? 'min-h-11 px-8 text-body-sm-bold' : 'min-h-9 px-4 text-caption-bold',
          ].join(' ')}
        >
          <RotateCcw size={isFull ? 16 : 13} aria-hidden="true" />
          {displayActionLabel}
        </button>
      ) : null}
    </section>
  );
}
