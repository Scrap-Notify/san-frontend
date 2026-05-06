import type { KnowledgeCardResponse, KnowledgeCardView } from '@san/shared';
import { CreatedKnowledgeCard } from './CreatedKnowledgeCard';
import { RelatedCards } from './RelatedCards';

interface KnowledgeProgressCardProps {
  cards: KnowledgeCardResponse[];
  isLoading: boolean;
  error: string | null;
  hasScrapContext: boolean;
  createdCard: KnowledgeCardView | null;
}

export default function KnowledgeProgressCard({
  cards,
  isLoading,
  error,
  hasScrapContext,
  createdCard,
}: KnowledgeProgressCardProps) {
  if (!hasScrapContext && !createdCard) {
    return null;
  }

  if (isLoading) {
    return <KnowledgeLoadingCard />;
  }

  return (
    <section>
      <div className="mb-3 text-sm font-medium uppercase text-[#e0e3e7]">
        {isLoading ? 'Creating knowledge card' : 'Knowledge result'}
      </div>
      <div className="space-y-3 rounded-[24px] border border-[#83958c]/20 bg-[#1e5056]/40 p-4 backdrop-blur-md">
        {createdCard ? <CreatedKnowledgeCard card={createdCard} /> : null}
        <RelatedCards
          cards={cards}
          isAuthenticated
          isLoading={isLoading}
          error={error}
          hasScrapContext={hasScrapContext || Boolean(createdCard)}
          onLogin={() => undefined}
        />
      </div>
    </section>
  );
}

function KnowledgeLoadingCard() {
  return (
    <section className="flex flex-col items-start self-stretch overflow-hidden rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px] border-l border-t border-[#3a4a43]/30 bg-[#1e5056]/40 p-6 backdrop-blur-xl">
      <div className="flex flex-col-reverse items-center self-stretch justify-center py-4">
        <div className="flex flex-col items-start pt-4">
          <div className="flex flex-col items-start gap-1">
            <div className="flex flex-col items-center self-stretch">
              <p className="text-center text-base font-medium text-[#fbfffa]">
                AI가 정보를 잎사귀로 변환 중...
              </p>
            </div>
            <div className="flex items-start justify-center self-stretch gap-1.5">
              <LoadingDot />
              <LoadingDot delayMs={150} />
              <LoadingDot delayMs={300} />
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center">
          <LeafIcon />
          <div className="absolute left-0 top-0 flex h-[34px] w-[34px] flex-col items-center opacity-20">
            <LeafOutlineIcon />
          </div>
        </div>
      </div>
    </section>
  );
}

function LoadingDot({ delayMs = 0 }: { delayMs?: number }) {
  return (
    <div
      className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00ffc2]"
      style={{
        animationDelay: `${delayMs}ms`,
        boxShadow: '0px 0px 15px 0 rgba(0,255,194,0.4)',
      }}
    />
  );
}

function LeafIcon() {
  return (
    <svg
      width={35}
      height={35}
      viewBox="0 0 35 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      preserveAspectRatio="none"
    >
      <path
        d="M16.5 34.0494C15.4 34.0494 14.2917 33.9244 13.175 33.6744C12.0583 33.4244 10.9167 33.0661 9.75 32.5994C10.15 28.5661 11.3167 24.7994 13.25 21.2994C15.1833 17.7994 17.6667 14.7161 20.7 12.0494C17.0333 13.9161 13.8583 16.3828 11.175 19.4494C8.49167 22.5161 6.61667 26.0161 5.55 29.9494C5.41667 29.8494 5.29167 29.7411 5.175 29.6244C5.05833 29.5078 4.93333 29.3828 4.8 29.2494C3.23333 27.6828 2.04167 25.9328 1.225 23.9994C0.408333 22.0661 0 20.0494 0 17.9494C0 15.6828 0.45 13.5161 1.35 11.4494C2.25 9.38277 3.5 7.54944 5.1 5.94944C7.8 3.24944 11.3 1.4911 15.6 0.674438C19.9 -0.142228 25.9333 -0.217228 33.7 0.449438C34.3 8.41611 34.2 14.4911 33.4 18.6744C32.6 22.8578 30.8667 26.2828 28.2 28.9494C26.5667 30.5828 24.7417 31.8411 22.725 32.7244C20.7083 33.6078 18.6333 34.0494 16.5 34.0494Z"
        fill="#00FFC2"
      />
    </svg>
  );
}

function LeafOutlineIcon() {
  return (
    <svg
      width={34}
      height={34}
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      preserveAspectRatio="none"
    >
      <path
        d="M4.8 29.1846C3.3 27.6846 2.125 25.9513 1.275 23.9846C0.425 22.0179 0 19.9846 0 17.8846C0 15.7846 0.4 13.7096 1.2 11.6596C2 9.60962 3.3 7.68462 5.1 5.88462C6.26667 4.71795 7.70833 3.71795 9.425 2.88462C11.1417 2.05128 13.175 1.39295 15.525 0.909615C17.875 0.426282 20.5583 0.134615 23.575 0.0346154C26.5917 -0.0653846 29.9667 0.051282 33.7 0.384615C33.9667 3.91795 34.05 7.16795 33.95 10.1346C33.85 13.1013 33.575 15.7763 33.125 18.1596C32.675 20.5429 32.0417 22.6263 31.225 24.4096C30.4083 26.1929 29.4 27.6846 28.2 28.8846C26.4333 30.6513 24.5583 31.9429 22.575 32.7596C20.5917 33.5763 18.5667 33.9846 16.5 33.9846C14.3333 33.9846 12.2167 33.5596 10.15 32.7096C8.08333 31.8596 6.3 30.6846 4.8 29.1846ZM10.4 28.3846C11.3667 28.9513 12.3583 29.3596 13.375 29.6096C14.3917 29.8596 15.4333 29.9846 16.5 29.9846C18.0333 29.9846 19.55 29.6763 21.05 29.0596C22.55 28.4429 23.9833 27.4513 25.35 26.0846C25.95 25.4846 26.5583 24.643 27.175 23.5596C27.7917 22.4763 28.325 21.0596 28.775 19.3096C29.225 17.5596 29.5667 15.4429 29.8 12.9596C30.0333 10.4763 30.0667 7.51795 29.9 4.08462C28.2667 4.01795 26.425 3.99295 24.375 4.00962C22.325 4.02628 20.2833 4.18462 18.25 4.48462C16.2167 4.78462 14.2833 5.26795 12.45 5.93462C10.6167 6.60128 9.11667 7.51795 7.95 8.68462C6.45 10.1846 5.41667 11.6679 4.85 13.1346C4.28333 14.6013 4 16.0179 4 17.3846C4 19.3513 4.375 21.0763 5.125 22.5596C5.875 24.0429 6.53333 25.0846 7.1 25.6846C8.5 23.018 10.35 20.4596 12.65 18.0096C14.95 15.5596 17.6333 13.5513 20.7 11.9846C18.3 14.0846 16.2083 16.4596 14.425 19.1096C12.6417 21.7596 11.3 24.8513 10.4 28.3846Z"
        fill="#00FFC2"
      />
    </svg>
  );
}
