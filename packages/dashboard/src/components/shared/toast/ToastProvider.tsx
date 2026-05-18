import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { AlertCircle, RotateCcw, X } from 'lucide-react';
import { ToastContext } from './toastContext';

export type ToastType = 'success' | 'error' | 'loading' | 'info';

export interface ToastInput {
  type?: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastItem extends Required<Omit<ToastInput, 'description'>> {
  id: number;
  description?: string;
}

const DEFAULT_DURATION = 3600;

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: ToastInput) => {
    const id = ++toastId;
    const nextToast: ToastItem = {
      id,
      type: toast.type ?? 'info',
      title: toast.title,
      description: toast.description,
      duration: toast.duration ?? DEFAULT_DURATION,
    };

    setToasts((current) => [nextToast, ...current].slice(0, 4));

    if (nextToast.type !== 'loading' && nextToast.duration > 0) {
      window.setTimeout(() => dismissToast(id), nextToast.duration);
    }

    return id;
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast, dismissToast }), [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-28 z-[60] flex w-[calc(100vw-32px)] max-w-[260px] flex-col gap-3 sm:right-8">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  if (toast.type === 'error') {
    return <ErrorToastCard toast={toast} onDismiss={onDismiss} />;
  }

  const tone = getToastTone(toast.type);

  return (
    <div
      role="status"
      className={[
        'pointer-events-auto flex w-full items-center justify-between gap-3',
        'rounded-tl-[24px] rounded-br-[24px] rounded-tr-lg rounded-bl-lg',
        'border bg-background/82 px-3.5 py-3 text-left backdrop-blur-2xl',
        'shadow-[0_12px_28px_rgba(0,0,0,0.28),0_0_16px_rgba(0,255,194,0.08)]',
        'san-toast-enter',
        tone.border,
      ].join(' ')}
    >
      <div className="flex min-w-0 flex-1 items-center">
        {toast.type === 'loading' ? <LoadingToastDots /> : null}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#e0e3e7]">{toast.title}</p>
          {toast.description ? (
            <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-text-secondary">{toast.description}</p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-secondary/55 transition hover:bg-white/5 hover:text-text-primary"
        aria-label="알림 닫기"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

function ErrorToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const message = toast.description ?? toast.title;

  return (
    <button
      type="button"
      role="alert"
      onClick={onDismiss}
      className={[
        'pointer-events-auto flex h-12 w-full max-w-[280px] self-end items-center gap-3 px-3.5 text-left',
        'rounded-tl-[28px] rounded-br-lg rounded-tr-lg rounded-bl-[28px]',
        'border border-[#3a4a43]/5 bg-[#18201f]/60 backdrop-blur-xl',
        'transition hover:border-primary-signal/10 hover:bg-[#18201f]/75',
        'san-toast-enter',
      ].join(' ')}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-highest text-primary-signal">
        <AlertCircle size={17} strokeWidth={1.8} aria-hidden="true" />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-xs font-bold text-text-primary">
          {message}
        </span>
        <span className="flex min-w-0 items-center gap-1 text-[10px] font-medium text-primary-signal">
          <RotateCcw size={10} strokeWidth={2} aria-hidden="true" />
          <span className="truncate">다시 확인하기</span>
        </span>
      </span>
    </button>
  );
}

function LoadingToastDots() {
  return (
    <div className="mr-3 flex shrink-0 items-center gap-1.5 px-1" aria-hidden="true">
      <span className="h-1.5 w-1.5 rounded-full bg-primary-signal" />
      <span className="h-1.5 w-1.5 rounded-full bg-primary-signal/40" />
      <span className="h-1.5 w-1.5 rounded-full bg-primary-signal/10" />
    </div>
  );
}

function getToastTone(type: ToastType) {
  if (type === 'error') {
    return { border: 'border-[#ffb4ab]/20' };
  }

  if (type === 'loading') {
    return { border: 'border-[#9ecfd6]/10' };
  }

  if (type === 'success') {
    return { border: 'border-primary-signal/30' };
  }

  return { border: 'border-primary-signal/10' };
}
