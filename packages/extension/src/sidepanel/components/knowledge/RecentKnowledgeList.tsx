import type { ReactNode } from 'react';
import type { KnowledgeCardResponse } from '@san/shared';
import { Copy, PackageOpen } from 'lucide-react';

const RECENT_TITLE = '\uCD5C\uADFC \uC9C0\uC2DD';
const LOADING_MESSAGE = '\uC800\uC7A5\uD55C \uC9C0\uC2DD\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\uC774\uC5D0\uC694.';
const ERROR_MESSAGE = '\uCD5C\uADFC \uC9C0\uC2DD\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694.';
const EMPTY_TITLE = '\uC544\uC9C1 \uC800\uC7A5\uB41C \uC9C0\uC2DD\uC774 \uC5C6\uC5B4\uC694.';
interface RecentKnowledgeListProps {
  cards: KnowledgeCardResponse[];
  isLoading: boolean;
  error: string | null;
  action?: ReactNode;
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

function openCardLink(cardId: string) {
  window.open(`/cards/${cardId}`, '_blank', 'noopener,noreferrer');
}

async function copyCard(card: KnowledgeCardResponse) {
  const tags = card.tags.map((tag) => `#${tag.tagName}`).join(' ');
  const lines = [
    card.title,
    card.summary,
    card.category ? `Category: ${card.category.categoryName}` : null,
    tags || null,
  ].filter(Boolean);

  await navigator.clipboard.writeText(lines.join('\n'));
}

export function RecentKnowledgeList({
  cards,
  isLoading,
  error,
  action,
}: RecentKnowledgeListProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex h-11 shrink-0 items-center justify-between gap-3">
        <div className="shrink-0 text-body-sm font-medium text-text-secondary/85">
          {RECENT_TITLE}
        </div>
        {action ? (
          <div className="flex min-w-0 flex-1 justify-end pr-3">
            {action}
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isLoading ? (
          <p className="rounded-leaf border border-text-secondary/10 bg-surface-container/50 px-4 py-3 text-body-sm text-text-secondary">
            {LOADING_MESSAGE}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-leaf border border-red-500/20 bg-red-500/10 px-4 py-3 text-body-sm text-red-300">
            {ERROR_MESSAGE}
          </p>
        ) : null}

        {!isLoading && !error && cards.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 pt-6 text-center">
            <div className="text-primary-signal/80 drop-shadow-[0_0_14px_rgba(0,255,194,0.45)]">
              <PackageOpen size={44} strokeWidth={1.6} aria-hidden="true" />
            </div>
            <p className="text-body-sm font-medium text-text-secondary">
              {EMPTY_TITLE}
            </p>
          </div>
        ) : null}

        {!isLoading && !error && cards.length > 0 ? (
          <div className="space-y-4 pb-4">
            {cards.map((card) => (
              <article
                key={card.cardId}
                onClick={() => openCardLink(card.cardId)}
                className="cursor-pointer rounded-leaf border border-text-secondary/12 bg-surface-container/80 px-5 py-5 transition hover:border-primary-signal/25 hover:bg-surface-container"
                role="link"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openCardLink(card.cardId);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3
                    className="line-clamp-1 cursor-text select-text text-body-main-bold text-text-primary"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {card.title}
                  </h3>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void copyCard(card);
                    }}
                    className="shrink-0 rounded-full p-1 text-text-secondary/75 transition hover:bg-white/5 hover:text-primary-signal active:translate-y-px"
                    aria-label="Copy card"
                    title="Copy card"
                  >
                    <Copy size={15} aria-hidden="true" />
                  </button>
                </div>

                {card.summary ? (
                  <p
                    className="mt-3 line-clamp-3 cursor-text select-text text-body-sm leading-6 text-text-secondary/85"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {card.summary}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {card.category ? (
                    <span className="inline-flex items-center rounded-full border border-primary-signal/25 bg-primary-signal/8 px-3 py-1.5 text-caption-bold uppercase text-primary-signal">
                      {card.category.categoryName}
                    </span>
                  ) : null}
                  {card.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.tagId}
                      className="inline-flex items-center rounded-full border border-primary-signal/25 bg-primary-signal/8 px-3 py-1.5 text-caption-bold uppercase text-primary-signal"
                    >
                      {tag.tagName}
                    </span>
                  ))}
                  <span className="ml-auto text-caption text-text-secondary/55">
                    {formatDate(card.createdAt)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
