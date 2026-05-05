interface EmptyStateProps {
  onLogin: () => void;
}

export function EmptyState({ onLogin }: EmptyStateProps) {
  return (
    <section className="rounded-xl border border-[#4ADE80]/20 bg-[#4ADE80]/5 p-5">
      <p className="text-sm font-semibold text-slate-200">로그인 후 관련 카드와 아카이브를 확인할 수 있어요.</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        지금은 드롭한 내용을 로컬에만 저장합니다. 대시보드에 로그인하면 관련 카드 탐색과 동기화가 활성화됩니다.
      </p>
      <button
        type="button"
        onClick={onLogin}
        className="mt-4 rounded-md bg-[#4ADE80] px-3 py-2 text-xs font-bold text-[#0A0F1E] transition hover:bg-[#2DD4BF]"
      >
        대시보드 로그인 열기
      </button>
    </section>
  );
}
