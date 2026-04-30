import type { DragEvent } from 'react';
import { useState } from 'react';
import type { PendingScrap } from '../../types';

interface DropZoneProps {
  pendingScrap: PendingScrap | null;
  onTextDrop: (text: string) => void | Promise<void>;
  onSave: () => void;
  onClear: () => void;
}

export const DropZone = ({ pendingScrap, onTextDrop, onSave, onClear }: DropZoneProps) => {
  const [isOver, setIsOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsOver(false);
    setError(null);

    const droppedText = event.dataTransfer.getData('text/plain').trim();
    if (droppedText.length < 10) {
      setError('Drop at least 10 characters.');
      return;
    }

    await onTextDrop(droppedText);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer
        border-2 border-dashed rounded-2xl p-5
        transition-all duration-300 ease-out
        flex flex-col gap-4
        ${isOver
          ? 'border-[#4ADE80] bg-[#4ADE80]/10 shadow-[0_0_24px_rgba(74,222,128,0.14)]'
          : 'border-slate-800 bg-white/[0.02] hover:border-slate-600'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`
          w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300
          ${isOver ? 'bg-[#4ADE80] text-[#0A0F1E]' : 'bg-slate-900 text-slate-500 group-hover:text-slate-300'}
        `}>
          <i className="fa-solid fa-leaf text-lg"></i>
        </div>

        <div className="min-w-0">
          <p className={`font-bold text-sm transition-colors ${isOver ? 'text-white' : 'text-slate-300'}`}>
            {isOver ? 'Drop to prepare a save' : 'Drop selected text here'}
          </p>
          <p className="text-[11px] text-slate-600 mt-1">Selected text must be at least 10 characters.</p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {pendingScrap && (
        <div className="bg-[#4ADE80]/10 border border-[#4ADE80]/30 rounded-lg p-3">
          <div className="flex justify-between items-start gap-3 mb-2">
            <span className="text-[10px] font-bold text-[#4ADE80] uppercase tracking-wider">
              Pending save
            </span>
            <button onClick={onClear} className="text-slate-500 hover:text-white" aria-label="Clear pending scrap">
              <i className="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>
          <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
            {pendingScrap.raw_content ?? pendingScrap.title}
          </p>
          <button
            onClick={onSave}
            className="mt-3 w-full bg-[#4ADE80] hover:bg-[#2DD4BF] text-[#0A0F1E] font-bold py-2 rounded-lg text-sm transition-all active:scale-[0.99]"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};
