import { useQuery } from '@tanstack/react-query';
import { useScrapStore } from '../store/scrapStore';
import { apiRequest } from '@san/shared/src/utils/api';
import type { ScrapCard } from '@san/shared/src/types';

export default function Dashboard() {
  const { cards, setCards, viewMode, setViewMode } = useScrapStore();

  useQuery({
    queryKey: ['scraps'],
    queryFn: async () => {
      const data = await apiRequest<ScrapCard[]>('/scraps');
      setCards(data);
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">내 지식 창고</h1>
        <p className="text-gray-500 mb-8">{cards.length}개의 스크랩이 연결되어 있어요</p>

        <div className="flex gap-2 mb-6">
          {(['card', 'graph'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                ${viewMode === mode
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-gray-500 border border-gray-200'}`}
            >
              {mode === 'card' ? '카드 뷰' : '그래프 뷰'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(card => (
            <div key={card.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <p className="font-semibold text-gray-900">{card.title}</p>
              <p className="text-sm text-gray-500 mt-1 line-clamp-3">{card.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}