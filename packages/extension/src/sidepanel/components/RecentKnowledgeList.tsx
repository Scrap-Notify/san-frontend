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
      <div className="mb-3 text-caption font-medium uppercase tracking-[0.14em] text-text-secondary">
        Recent archive
      </div>
      <div className="rounded-leaf border border-text-secondary/20 bg-surface-container/80 p-popover-padding backdrop-blur-md">
        {isLoading ? (
          <p className="text-body-main text-text-secondary">Loading recent cards...</p>
        ) : null}

        {error ? (
          <p className="text-body-main text-red-300">{error}</p>
        ) : null}

        {!isLoading && !error && cards.length === 0 ? (
          <div>
            <p className="text-body-main-bold text-text-primary">No knowledge cards yet</p>
            <p className="mt-1 text-caption text-text-secondary leading-5">
              Capture a source and save it to create your first card.
            </p>
          </div>
        ) : null}

        {!isLoading && !error && cards.length > 0 ? (
          <div className="space-y-3">
            {cards.slice(0, 3).map((card) => (
              <article key={card.card_id} className="rounded-leaf border border-text-secondary/20 bg-surface-highest/80 p-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-1 text-body-main-bold text-text-primary">{card.title}</h3>
                  <span className="shrink-0 text-caption text-text-secondary">
                    {formatDate(card.created_at)}
                  </span>
                </div>
                {card.summary ? (
                  <p className="mt-2 line-clamp-2 text-caption leading-5 text-text-secondary">
                    {card.summary}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
