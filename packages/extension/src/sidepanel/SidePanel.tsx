import { useState, useEffect } from 'react';
import type { ScrapCard } from '@san/shared/src/types';

export default function SidePanel() {
  const [cards, _setCards] = useState<ScrapCard[]>([]);
  const [pendingScrap, setPendingScrap] = useState<string | null>(null);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'TEXT_SELECTED') {
        setPendingScrap(msg.payload.text);
      }
    });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white/80 backdrop-blur-md p-4 gap-3">
      <h1 className="text-lg font-bold text-emerald-600">SAN</h1>

      {pendingScrap && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm">
          <p className="text-gray-600 line-clamp-3">{pendingScrap}</p>
          <button
            className="mt-2 w-full bg-emerald-500 text-white rounded-lg py-1.5 text-sm font-medium"
            onClick={() => {/* API 호출 */}}
          >
            스크랩 저장
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 overflow-y-auto">
        {cards.map(card => (
          <div key={card.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <p className="font-medium text-sm text-gray-800 line-clamp-1">{card.title}</p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.summary}</p>
            <div className="flex gap-1 mt-2 flex-wrap">
              {card.tags.map(tag => (
                <span key={tag} className="text-xs bg-mint-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}