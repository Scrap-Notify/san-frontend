import type { KnowledgeCardView } from '@san/shared';

interface RecentKnowledgeListProps {
  cards: KnowledgeCardView[];
  isLoading: boolean;
  error: string | null;
}

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function RecentKnowledgeList({ cards, isLoading, error }: RecentKnowledgeListProps) {
  return (
    <section>
      <div className="mb-3 text-sm font-medium uppercase text-[#e0e3e7]">Recent archive</div>
      <div className="rounded-[24px] border border-[#83958c]/20 bg-[#1e5056]/40 p-4 backdrop-blur-md">
        {isLoading ? (
          <p className="text-sm font-semibold text-[#b9cbc1]">Loading recent cards...</p>
        ) : null}

        {error ? (
          <p className="text-sm font-semibold text-red-300">{error}</p>
        ) : null}

        {!isLoading && !error && cards.length === 0 ? (
          <div>
            <p className="text-sm font-semibold text-[#e0e3e7]">No knowledge cards yet</p>
            <p className="mt-1 text-xs leading-5 text-[#b9cbc1]">
              Capture a source and save it to create your first card.
            </p>
          </div>
        ) : null}

        {!isLoading && !error && cards.length > 0 ? (
          <div className="space-y-3">
            {cards.slice(0, 3).map((card) => (
              <article key={card.card_id} className="rounded-[18px] border border-white/5 bg-[#101417]/70 p-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-1 text-sm font-bold text-[#e0e3e7]">{card.title}</h3>
                  <span className="shrink-0 text-[10px] text-[#83958c]">
                    {formatDate(card.created_at)}
                  </span>
                </div>
                {card.summary ? (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#b9cbc1]">{card.summary}</p>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
