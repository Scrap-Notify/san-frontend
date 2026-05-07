import type { TilResponse } from '@san/shared';
import type { TilRecallCardsQuery } from '../types';
import { CollectedDataCard, type CollectedDataItem } from './CollectedDataCard';

interface CollectedDataPanelProps {
  recallCardsQuery: TilRecallCardsQuery;
  selectedTil: TilResponse | null;
}

export function CollectedDataPanel({ recallCardsQuery, selectedTil }: CollectedDataPanelProps) {
  const items: CollectedDataItem[] = recallCardsQuery.data?.recallCards.map((card) => ({
    id: card.cardId,
    type: 'text' as const,
    title: card.title,
    timeLabel: new Date(card.createdAt).toLocaleDateString(),
    excerpt: card.summary || '',
    tag: card.category?.categoryName,
  })) ?? [];

  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[8px] bg-background/80 shadow-neon-sm backdrop-blur-xl">
      <header className="shrink-0 border-b border-text-secondary/20 p-lg">
        <h2 className="text-h1-bold uppercase leading-none text-text-primary">
          내가 수집한 데이터
        </h2>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-md overflow-y-auto p-lg">
        {recallCardsQuery.isPending && !selectedTil && (
          <div className="text-center text-body-main text-text-secondary">로딩 중...</div>
        )}
        {!selectedTil && (
          <div className="text-center text-body-main text-text-secondary">TIL을 선택해주세요</div>
        )}
        {selectedTil && items.length === 0 && (
          <div className="text-center text-body-main text-text-secondary">수집된 데이터가 없습니다</div>
        )}
        {items.map((item) => (
          <CollectedDataCard key={item.id} item={item} />
        ))}
      </div>
    </aside>
  );
}
