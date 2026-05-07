interface EmptyStateProps {
  onLogin: () => void;
}

export function EmptyState({ onLogin }: EmptyStateProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 pb-10 text-center">
      <p className="max-w-[320px] text-body-sm leading-6 text-text-secondary">
        수집한 정보가 지식의 숲으로 자라나요.
      </p>
      <p>
        <button
          type="button"
          onClick={onLogin}
          className="text-body-main-bold text-text-primary transition active:translate-y-px"
        >
          <span className="text-primary-signal [text-shadow:0_0_8px_rgba(0,255,194,0.55),0_0_18px_rgba(0,255,194,0.28)]">
            로그인
          </span>
          하여 저장하기
        </button>
      </p>
    </div>
  );
}
