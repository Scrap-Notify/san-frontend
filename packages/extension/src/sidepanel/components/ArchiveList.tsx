import type { SavedInsight } from '../../types';
import { CardList } from './CardList';

interface ArchiveListProps {
  cards: SavedInsight[];
}

export function ArchiveList({ cards }: ArchiveListProps) {
  return (
    <section>
      <div className="mb-3 text-caption font-medium uppercase tracking-[0.14em] text-text-secondary">최근 아카이브</div>
      <CardList cards={cards} />
    </section>
  );
}
