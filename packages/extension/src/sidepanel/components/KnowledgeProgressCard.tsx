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
