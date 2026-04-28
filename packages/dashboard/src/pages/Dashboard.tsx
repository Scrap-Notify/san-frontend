// shared 패키지의 '정문'에서 필요한 것들만 쏙쏙 가져옵니다.
import { useCards, type KnowledgeCardView } from '@san/shared';
import { useScrapStore } from '../store/scrapStore';

export default function Dashboard() {
  const { viewMode, setViewMode } = useScrapStore();

  // 1. useCards에서 반환된 전체 데이터를 가져옵니다.
  const { data, isLoading, isError } = useCards();

  // 2. 전체 데이터(상자) 안에서 진짜 카드 리스트(내용물)만 추출합니다.
  // 데이터가 아직 로딩 중일 수 있으니 빈 배열([])을 기본값으로 둡니다.
  const cardList = data?.cards ?? [];

  // 로딩 및 에러 처리
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-emerald-500 animate-pulse font-medium">지식 카드를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 섹션 */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">내 지식 창고</h1>
          <p className="text-gray-500">
            {cardList.length}개의 지식이 안전하게 보관되어 있어요
          </p>
        </header>

        {/* 뷰 모드 전환 버튼 */}
        <div className="flex gap-2 mb-6">
          {(['card', 'graph'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200
                ${viewMode === mode
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-emerald-300'}`}
            >
              {mode === 'card' ? '📂 카드 뷰' : '🕸️ 그래프 뷰'}
            </button>
          ))}
        </div>

        {/* 지식 카드 리스트 */}
        {viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cardList.map((card: KnowledgeCardView) => (
              <article 
                key={card.card_id} // card.id가 아닌 card_id 사용
                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 
                           hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="flex flex-col h-full">
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {card.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mt-3 line-clamp-3 flex-grow leading-relaxed">
                    {card.summary || '요약된 내용이 없습니다.'}
                  </p>

                  {/* 태그 영역 (있는 경우) */}
                  {card.tags && card.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {card.tags.map(tag => (
                        <span key={tag.tag_id} className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md">
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* 그래프 뷰 플레이스홀더 */
          <div className="bg-white rounded-3xl p-20 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
            <p className="text-gray-400 font-medium text-lg">지식 네트워크 그래프 준비 중...</p>
            <p className="text-gray-300 text-sm mt-2">Phase 2에서 공개될 예정입니다!</p>
          </div>
        )}
      </div>
    </div>
  );
}