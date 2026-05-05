interface EmptyStateProps {
  onLogin: () => void;
}

export function EmptyState({ onLogin }: EmptyStateProps) {
  return (
    <section className="rounded-[24px] border border-[#00ffc2]/20 bg-[#00ffc2]/5 p-5">
      <p className="text-sm font-semibold text-[#e0e3e7]">Login to build your archive</p>
      <p className="mt-2 text-xs leading-5 text-[#b9cbc1]">
        Capture source material here, then login to save it as a knowledge card.
      </p>
      <button
        type="button"
        onClick={onLogin}
        className="mt-4 rounded-md bg-[#00ffc2] px-3 py-2 text-xs font-bold text-black transition hover:opacity-90"
      >
        Open dashboard login
      </button>
    </section>
  );
}
