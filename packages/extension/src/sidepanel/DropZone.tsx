// packages/extension/src/sidepanel/components/DropZone.tsx
import { useState } from 'react';

export const DropZone = () => {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => { e.preventDefault(); setIsOver(false); /* 드롭 처리 로직 */ }}
      className={`
        relative group cursor-pointer
        border-2 border-dashed rounded-[2rem] p-8
        transition-all duration-500 ease-out
        flex flex-col items-center justify-center gap-3
        ${isOver 
          ? 'border-[#4ADE80] bg-[#4ADE80]/10 shadow-[0_0_30px_rgba(74,222,128,0.15)] scale-[1.02]' 
          : 'border-slate-800 bg-white/[0.02] hover:border-slate-600'
        }
      `}
    >
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
        ${isOver ? 'bg-[#4ADE80] text-[#0A0F1E] rotate-12' : 'bg-slate-900 text-slate-500 group-hover:text-slate-300'}
      `}>
        <i className="fa-solid fa-leaf text-xl"></i>
      </div>
      
      <div className="text-center">
        <p className={`font-bold text-sm transition-colors ${isOver ? 'text-white' : 'text-slate-400'}`}>
          {isOver ? '지식을 여기에 놓으세요' : 'URL을 드래그하세요'}
        </p>
        <p className="text-[10px] text-slate-600 mt-1">심해에 지식의 씨앗 심기</p>
      </div>
    </div>
  );
};