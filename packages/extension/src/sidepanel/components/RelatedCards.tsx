import type { KnowledgeCardView } from '@san/shared';

interface RelatedCardsProps {
  cards: KnowledgeCardView[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasPendingScrap: boolean;
  onLogin: () => void;
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

export function RelatedCards({
  cards,
  isAuthenticated,
  isLoading,
  error,
  hasPendingScrap,
  onLogin,
}: RelatedCardsProps) {
  if (!hasPendingScrap) {
    return (
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
        <p className="text-sm font-semibold text-slate-400">Related cards</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Prepare a scrap to find related knowledge cards.
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-[#4ADE80]/20 bg-[#4ADE80]/5 p-4">
        <p className="text-sm font-semibold text-slate-300">Login to see related cards</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Related knowledge cards are shown for your dashboard account.
        </p>
        <button
          type="button"
          onClick={onLogin}
          className="mt-3 rounded-md bg-[#4ADE80] px-3 py-2 text-xs font-bold text-[#0A0F1E] transition hover:bg-[#2DD4BF]"
        >
          Open dashboard login
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
        <p className="text-sm font-semibold text-slate-400">Finding related cards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
        <p className="text-sm font-semibold text-red-300">Related cards could not be loaded</p>
        <p className="mt-1 text-xs leading-5 text-red-200/70">{error}</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
        <p className="text-sm font-semibold text-slate-400">No related cards found</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Save more knowledge cards in the dashboard to improve matches.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <article
          key={card.card_id}
          className="rounded-lg border border-white/5 bg-white/[0.03] p-4 transition hover:border-[#4ADE80]/20 hover:bg-white/[0.06]"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 text-sm font-bold text-slate-200">{card.title}</h3>
            <span className="shrink-0 text-[10px] text-slate-600">
              {formatDate(card.created_at ?? card.createdAt)}
            </span>
          </div>
          {card.summary ? (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{card.summary}</p>
          ) : null}
          {card.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {card.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.tag_id}
                  className="rounded-md border border-white/5 bg-slate-900 px-2 py-0.5 text-[9px] font-bold text-slate-500"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
