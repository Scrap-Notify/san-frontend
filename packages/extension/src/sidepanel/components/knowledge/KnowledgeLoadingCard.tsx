import { Leaf } from 'lucide-react';

interface LoadingDotProps {
  delayMs?: number;
}

export function KnowledgeLoadingCard() {
  return (
    <section className="relative flex h-[220px] w-full items-center justify-center overflow-hidden rounded-leaf border border-primary-signal/20 bg-surface-container px-6 py-8 backdrop-blur-xl">
      <div className="absolute inset-0 bg-primary-signal/5" aria-hidden="true" />
      <div className="absolute inset-x-10 top-8 h-28 rounded-full bg-primary-signal/10 blur-3xl" aria-hidden="true" />

      <div className="relative flex flex-col items-center gap-5 text-center">
        <div className="relative flex h-12 w-12 items-center justify-center text-primary-signal">
          <div className="absolute inset-1 rounded-full bg-primary-signal/20 blur-xl" aria-hidden="true" />
          <Leaf size={34} className="relative" aria-hidden="true" />
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-body-sm font-medium text-text-primary">
            AI가 정보를 잎사귀로 변환 중...
          </p>
          <div className="flex items-center justify-center gap-2.5" aria-hidden="true">
            <LoadingDot />
            <LoadingDot delayMs={150} />
            <LoadingDot delayMs={300} />
          </div>
        </div>
      </div>
    </section>
  );
}

function LoadingDot({ delayMs = 0 }: LoadingDotProps) {
  return (
    <span
      className="h-2 w-2 animate-pulse rounded-full bg-primary-signal shadow-neon"
      style={{
        animationDelay: `${delayMs}ms`,
        animationDuration: '900ms',
      }}
    />
  );
}
