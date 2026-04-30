// packages/dashboard/src/components/ArchiveSection.tsx
// Archive 섹션 — LeafCard 그리드
// 데이터 조회는 useArchiveCards 훅이 담당

import { useArchiveCards } from '../hooks/useArchiveCards';
import { LeafCard } from '@san/ui';

export function ArchiveSection() {
  const { cards, isPending, isError } = useArchiveCards();

  return (
    <section className="px-8 pb-16">

      {/* 섹션 헤더 */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#fbfffa] tracking-tight">Archive</h2>
          <p className="text-sm text-[#83958c] mt-0.5">저장된 기억의 파편들</p>
        </div>
        <div className="flex gap-2">
          <button
            className="w-10 h-10 rounded-full border border-[#1e5056]/60
                       flex items-center justify-center text-[#83958c]
                       hover:border-[#00ffc2]/40 hover:text-[#00ffc2] transition-all"
            aria-label="이전"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="w-10 h-10 rounded-full border border-[#1e5056]/60
                       flex items-center justify-center text-[#83958c]
                       hover:border-[#00ffc2]/40 hover:text-[#00ffc2] transition-all"
            aria-label="다음"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 로딩 */}
      {isPending && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-leaf bg-[#181c1f] animate-pulse" />
          ))}
        </div>
      )}

      {/* 에러 */}
      {isError && (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-[#83958c]">카드를 불러오지 못했어요</p>
        </div>
      )}

      {/* 빈 상태 */}
      {!isPending && !isError && cards.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-[#83958c] text-center leading-relaxed">
            아직 저장된 지식이 없어요.<br />
            익스텐션으로 첫 번째 스크랩을 시작해보세요.
          </p>
        </div>
      )}

      {/* 카드 그리드 */}
      {!isPending && !isError && cards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <LeafCard
              key={card.card_id}
              card={card}
              variant="full"
              onClick={() => {
                if (card.source_url) window.open(card.source_url, '_blank');
              }}
            />
          ))}
        </div>
      )}

    </section>
  );
}
