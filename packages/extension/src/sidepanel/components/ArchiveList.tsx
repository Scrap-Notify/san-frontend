import type { SavedInsight } from '../../types';
import { CardList } from './CardList';

interface ArchiveListProps {
  cards: SavedInsight[];
}

export function ArchiveList({ cards }: ArchiveListProps) {
  return (
    <section>
      <div className="mb-3 text-sm font-medium uppercase text-[#e0e3e7]">최근 아카이브</div>
      <CardList cards={cards} />
    </section>
  );
}
