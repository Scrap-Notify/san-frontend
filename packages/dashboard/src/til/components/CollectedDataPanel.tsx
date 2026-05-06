import { useTilPageLogic } from '../hooks/useTilPageLogic';
import { CollectedDataCard, type CollectedDataItem } from './CollectedDataCard';

export function CollectedDataPanel() {
  const { recallCardsQuery, selectedTil } = useTilPageLogic();

  const items: CollectedDataItem[] = recallCardsQuery.data?.recallCards.map((card) => ({
    id: card.cardId,
    type: 'text' as const,
    title: card.title,
    timeLabel: new Date(card.createdAt).toLocaleDateString(),
    excerpt: card.summary || '',
    tag: card.category?.categoryName,
  })) ?? [];

  return (
    <aside className="flex min-h-0 w-96 flex-col bg-[#181c1f]/50 shadow-[-10px_0_30px_rgba(0,0,0,0.2)] backdrop-blur-xl">
      <header className="border-b border-[#3a4a43]/20 p-6">
        <h2 className="text-[32px] font-bold uppercase leading-none text-[#fbfffa]">
          내가 수집한 데이터
        </h2>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
        {recallCardsQuery.isPending && !selectedTil && (
          <div className="text-center text-[#b9cbc1]">로딩 중...</div>
        )}
        {!selectedTil && (
          <div className="text-center text-[#b9cbc1]">TIL을 선택해주세요</div>
        )}
        {selectedTil && items.length === 0 && (
          <div className="text-center text-[#b9cbc1]">수집된 데이터가 없습니다</div>
        )}
        {items.map((item) => (
          <CollectedDataCard key={item.id} item={item} />
        ))}
      </div>
    </aside>
  );
}