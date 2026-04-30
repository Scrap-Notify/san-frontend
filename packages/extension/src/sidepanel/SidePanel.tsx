// packages/extension/src/sidepanel/SidePanel.tsx
import { useState, useEffect } from 'react';
import { DropZone } from './DropZone';
import { CardList } from './CardList';

const DEBUG_PREFIX = '[SAN:sidepanel]';
const isDebug = import.meta.env.DEV;

function debugLog(message: string, data?: unknown) {
  if (!isDebug) return;
  if (data === undefined) {
    console.debug(DEBUG_PREFIX, message);
    return;
  }
  console.debug(DEBUG_PREFIX, message, data);
}

export default function SidePanel() {
  const [pendingScrap, setPendingScrap] = useState<string | null>(null);

  // 브라우저에서 드래그로 선택한 텍스트 감지 (Chrome API)
  useEffect(() => {
    debugLog('side panel mounted');

    const handleMessage = (msg: any) => {
      debugLog('runtime message received', msg);
      // 백그라운드에서 보내는 타입('PUSH_TO_SIDEPANEL')과 일치시킵니다.
      if (msg.type === 'PUSH_TO_SIDEPANEL') {
        // payload 전체(PendingScrap)를 받아서 처리할 수 있게 됩니다.
        setPendingScrap(msg.payload.raw_content ?? msg.payload.title ?? null);
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0A0F1E] text-slate-200 font-sans overflow-hidden">
      {/* 상단 헤더 */}
      <header className="p-5 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse shadow-[0_0_10px_#4ADE80]" />
          <h1 className="text-xl font-black tracking-tighter text-white">SAN</h1>
        </div>
        <button className="text-slate-500 hover:text-[#4ADE80] transition-colors">
          <i className="fa-solid fa-gear"></i>
        </button>
      </header>

      {/* 스크롤 가능한 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
        
        {/* 1. 드롭존 영역 */}
        <section>
          <DropZone />
        </section>

        {/* 2. 텍스트 스크랩 제안 (감지 시에만 노출) */}
        {pendingScrap && (
          <section className="bg-[#4ADE80]/10 border border-[#4ADE80]/30 rounded-2xl p-4 backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-[#4ADE80] uppercase tracking-wider">New Insight Found</span>
              <button onClick={() => setPendingScrap(null)} className="text-slate-500 hover:text-white">
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>
            <p className="text-sm text-slate-300 line-clamp-3 mb-3 leading-relaxed italic">
              "{pendingScrap}"
            </p>
            <button className="w-full bg-[#4ADE80] hover:bg-[#2DD4BF] text-[#0A0F1E] font-bold py-2 rounded-xl text-sm transition-all transform active:scale-95">
              지식으로 저장하기
            </button>
          </section>
        )}

        {/* 3. 수집된 카드 리스트 */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Collected Insights</h2>
            <span className="text-[10px] text-slate-600">3 items</span>
          </div>
          <CardList />
        </section>
      </div>
    </div>
  );
}
