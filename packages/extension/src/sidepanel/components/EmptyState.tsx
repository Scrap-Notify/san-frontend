interface EmptyStateProps {
  onLogin: () => void;
}

export function EmptyState({ onLogin }: EmptyStateProps) {
  return (
    <div className="w-full max-w-[380px] mx-auto flex flex-col items-center text-center py-10 space-y-6">
      <div className="w-40 h-40 rounded-full bg-[#00ffc2]/5 flex items-center justify-center">
        🌱
      </div>

      <div className="text-xl font-bold text-[#e0e3e7] leading-snug">
        나만의 지식 숲을
        <br />
        시작해 보세요
      </div>

      <div className="text-sm text-[#b9cbc1] leading-6">
        로그인하면 수집한 정보가
        <br />
        울창한 지식의 숲으로 자라납니다.
      </div>

      <button
        type="button"
        onClick={onLogin}
        className="px-6 py-3 bg-[#00ffc2] text-black rounded-full font-bold shadow-[0_0_25px_rgba(0,255,194,0.3)] transition hover:opacity-90"
      >
        로그인하고 시작하기 →
      </button>
    </div>
  );
}
