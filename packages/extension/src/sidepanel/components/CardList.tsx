import type { SavedInsight } from '../../types';
import ArchiveItem from './ArchiveItem';

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
      <div className="rounded-[20px] border border-white/5 bg-[#181c1f] p-5 text-center">
        <p className="text-sm font-semibold text-[#e0e3e7]">No local captures yet</p>
        <p className="mt-1 text-xs text-[#b9cbc1]">Captured sources will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      {cards.map((card) => (
        <ArchiveItem
          key={card.id}
          title={card.title || card.domain || 'Untitled'}
          meta={`${card.source_type} / ${formatTime(card.created_at)}`}
        />
      ))}
    </div>
  );
};
