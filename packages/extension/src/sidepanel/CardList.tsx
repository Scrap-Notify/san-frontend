// packages/extension/src/sidepanel/components/CardList.tsx

// 임시 더미 데이터 (기획 확인용)
const MOCK_CARDS = [
  { id: 1, title: "React v19 새로운 기능 정리", summary: "컴파일러 도입과 향상된 서버 컴포넌트 지원에 대한 핵심 요약...", tags: ["React", "Web"] },
  { id: 2, title: "Tailwind v4 설정 가이드", summary: "CSS-first 방식의 새로운 설정법과 성능 최적화 포인트...", tags: ["CSS", "Design"] },
  { id: 3, title: "Chrome Extension 개발 팁", summary: "SidePanel API와 CRXJS를 활용한 효율적인 개발 워크플로우...", tags: ["Chrome", "Dev"] },
];

export const CardList = () => {
  return (
    <div className="space-y-4 pb-10">
      {MOCK_CARDS.map((card) => (
        <div 
          key={card.id}
          className="group bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.06] hover:border-[#4ADE80]/20 transition-all duration-300 cursor-pointer"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-slate-200 group-hover:text-[#4ADE80] transition-colors line-clamp-1">
              {card.title}
            </h3>
            <i className="fa-solid fa-chevron-right text-[10px] text-slate-700 group-hover:text-slate-400 mt-1"></i>
          </div>
          
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
            {card.summary}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {card.tags.map(tag => (
              <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-500 border border-white/5">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};