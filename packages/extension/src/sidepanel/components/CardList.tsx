import type { SavedInsight } from '../../types';

interface CardListProps {
  cards: SavedInsight[];
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export const CardList = ({ cards }: CardListProps) => {
  if (cards.length === 0) {
    return (
      <div className="border border-white/5 rounded-lg bg-white/[0.02] p-5 text-center">
        <p className="text-sm font-semibold text-slate-400">No saved insights yet</p>
        <p className="mt-1 text-xs text-slate-600">Drop text and save it to see collected metadata here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-10">
      {cards.map((card) => (
        <div
          key={card.id}
          className="group bg-white/[0.03] border border-white/5 rounded-lg p-4 hover:bg-white/[0.06] hover:border-[#4ADE80]/20 transition-all duration-300"
        >
          <div className="flex justify-between items-start gap-3 mb-2">
            <h3 className="text-sm font-bold text-slate-200 group-hover:text-[#4ADE80] transition-colors line-clamp-1">
              {card.title || card.domain || 'Untitled'}
            </h3>
            <span className="shrink-0 text-[10px] text-slate-600">{formatTime(card.created_at)}</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-3">
            {card.raw_content ?? card.source_url ?? 'No content'}
          </p>

          <div className="flex flex-wrap gap-1.5">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-500 border border-white/5">
              #{card.source_type}
            </span>
            {card.domain && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-500 border border-white/5">
                #{card.domain}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
