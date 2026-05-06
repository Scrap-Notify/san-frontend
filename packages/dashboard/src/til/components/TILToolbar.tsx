import {
  Bold,
  Italic,
  Link,
  List,
  RotateCcw,
  Play,
  GitBranch,
} from 'lucide-react';

export function TILToolbar({
  onReset,
  onGenerate,
  onCommit,
  onFormat,
  isGenerating,
  isCommitting,
}: {
  onReset?: () => void;
  onGenerate?: () => void;
  onCommit?: () => void;
  onFormat?: (action: 'bold' | 'italic' | 'list' | 'link') => void;
  isGenerating?: boolean;
  isCommitting?: boolean;
}) {
  return (
    <div className="flex h-12 items-center justify-between bg-[#181c1f]/50 px-6 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-1 border-r border-[#3a4a43] pr-3">
        <ToolbarButton label="Bold" onClick={() => onFormat?.('bold')}>
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => onFormat?.('italic')}>
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton label="List" onClick={() => onFormat?.('list')}>
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton label="Link" onClick={() => onFormat?.('link')}>
          <Link size={14} />
        </ToolbarButton>

        <span className="ml-2 text-xs text-[#b9cbc1]">UTF-8</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#00e1ab]/10 px-2 py-1 text-base text-[#00e1ab] transition hover:bg-[#00e1ab]/15 disabled:opacity-50"
        >
          <Play size={14} />
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>

        <button
          type="button"
          onClick={onCommit}
          disabled={isCommitting}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#00e1ab]/10 px-2 py-1 text-base text-[#00e1ab] transition hover:bg-[#00e1ab]/15 disabled:opacity-50"
        >
          <GitBranch size={14} />
          {isCommitting ? 'Committing...' : 'Commit'}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#00e1ab]/10 px-2 py-1 text-base text-[#00e1ab] transition hover:bg-[#00e1ab]/15"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-2xl text-[#b9cbc1] transition hover:bg-white/5 hover:text-[#00ffc2]"
    >
      {children}
    </button>
  );
}