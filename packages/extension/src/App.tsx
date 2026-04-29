// packages/extension/src/App.tsx
import '@san/ui/styles/globals.css'; // ✅ 경로 구체화 + 확장자 포함

const App = () => {
  return (
    // 1. 전체 컨테이너: 심해 어둠 배경, Pretendard 폰트, 화면 꽉 차게
    <div className="flex h-screen w-full flex-col bg-background text-text-primary font-sans overflow-hidden">
      
      {/* 2. 상단 헤더: 로고와 제목 */}
      <header className="flex h-16 items-center justify-between border-b border-surface p-4">
        <div className="flex items-center gap-2">
          {/* 우리가 합의한 Leaf-Radius가 적용된 로고 플레이스홀더 */}
          <div className="h-7 w-7 rounded-leaf bg-neon border border-neon-dim glow-neon-sm" />
          <h1 className="text-xl font-bold tracking-tight text-text-primary">SAN</h1>
          <span className="text-xs text-text-ghost mt-1">지식 창고</span>
        </div>
        {/* 나중에 설정을 넣을 수 있는 버튼 영역 */}
        <button className="text-text-muted hover:text-neon transition-colors">
          <i className="fa-solid fa-cog"></i>
        </button>
      </header>

      {/* 3. 메인 콘텐츠 영역: 실제 부품들이 들어갈 곳 */}
      <main className="flex-grow p-4 space-y-4 overflow-y-auto">
        {/* Placeholder: 여기에 DropZone과 CardList가 들어갑니다 */}
        <div className="border-2 border-dashed border-surface rounded-xl p-10 text-center text-text-muted">
          지식을 드래그해서 넣어주세요 🍃
        </div>
        
        <div className="space-y-3">
          <div className="h-20 bg-surface rounded-lg animate-pulse" />
          <div className="h-20 bg-surface rounded-lg animate-pulse" />
        </div>
      </main>

      {/* 4. 하단 바: 정보 표시 */}
      <footer className="flex h-12 items-center justify-center border-t border-surface p-3">
        <p className="text-[10px] uppercase tracking-widest text-text-ghost">
          Knowledge Archive v1.0
        </p>
      </footer>
    </div>
  );
};

export default App;