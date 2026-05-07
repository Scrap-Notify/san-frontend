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
      <div className="rounded-leaf border border-text-secondary/20 bg-surface-container p-popover-padding text-center">
        <p className="text-body-main-bold text-text-primary">No local captures yet</p>
        <p className="mt-1 text-caption text-text-secondary">Captured sources will appear here.</p>
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
