import type { KnowledgeCardResponse, KnowledgeCardView } from '@san/shared';
import { Leaf } from 'lucide-react';
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
      <div className="mb-3 text-caption font-medium uppercase tracking-[0.14em] text-text-secondary">
        {isLoading ? 'Creating knowledge card' : 'Knowledge result'}
      </div>
      <div className="space-y-3 rounded-leaf border border-text-secondary/20 bg-misty-teal/50 p-popover-padding backdrop-blur-md">
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
    <section className="flex flex-col items-start w-full overflow-hidden rounded-leaf border border-text-secondary/20 bg-misty-teal/60 p-6 backdrop-blur-xl">
      <div className="flex flex-col-reverse items-center w-full justify-center py-4 gap-6">
        <div className="flex flex-col items-start pt-4 w-full">
          <div className="flex flex-col items-start gap-3">
            <p className="text-body-main font-medium text-text-primary text-center w-full">
              AI가 정보를 잎사귀로 변환 중...
            </p>
            <div className="flex items-center justify-center gap-2.5 w-full">
              <LoadingDot />
              <LoadingDot delayMs={150} />
              <LoadingDot delayMs={300} />
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center">
          <Leaf size={34} className="text-primary-signal" aria-hidden="true" />
          <div className="absolute left-0 top-0 flex h-[34px] w-[34px] items-center justify-center opacity-20">
            <Leaf size={34} className="text-primary-signal" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

function LoadingDot({ delayMs = 0 }: { delayMs?: number }) {
  return (
    <div
      className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-signal shadow-neon"
      style={{ animationDelay: `${delayMs}ms` }}
    />
  );
}
