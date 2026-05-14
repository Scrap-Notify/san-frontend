import type { SavedInsight } from '@extension/types';
import { CardList } from './CardList';

interface ArchiveListProps {
  cards: SavedInsight[];
}

export function ArchiveList({ cards }: ArchiveListProps) {
  return (
    <section>
      <div className="mb-3 text-caption font-medium uppercase tracking-[0.14em] text-text-secondary">
        Local captures
      </div>
      <CardList cards={cards} />
    </section>
  );
}
