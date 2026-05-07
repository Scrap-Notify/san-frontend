import { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bold, Italic, List, Link as LinkIcon, RotateCcw, ArrowRight } from 'lucide-react';
import type { TILMode } from './TILModeTabs';
import type { TilResponse } from '@san/shared';

interface TILEditorProps {
  activeTab: TILMode;
  draft: string;
  setDraft: (value: string) => void;
  selectedTil: TilResponse | null;
  generateMutation: { isPending: boolean; mutate: () => void; };
  commitMutation: { isPending: boolean; mutate: (summaryId: string) => void; };
  generationStatusQuery: { data?: { status?: string }; };
  commitStatusQuery: { data?: { status?: string }; };
}

export function TILEditor({
  activeTab,
  draft,
  setDraft,
  selectedTil,
  generateMutation,
  commitMutation,
  generationStatusQuery,
  commitStatusQuery,
}: TILEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const isGenerating = generateMutation.isPending || isRunning(generationStatusQuery.data?.status);
  const isCommitting = commitMutation.isPending || isRunning(commitStatusQuery.data?.status);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const displayedDraft = draft || (selectedTil?.content ?? '');

  const handleFormat = (action: 'bold' | 'italic' | 'list' | 'link') => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    const selection = editor.getSelection();
    if (!model || !selection) return;

    const selectedText = model.getValueInRange(selection);
    let replacement = selectedText;
    switch (action) {
      case 'bold':
        replacement = `**${selectedText || 'text'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || 'text'}*`;
        break;
      case 'list':
        replacement = `\n- ${selectedText || 'item'}`;
        break;
      case 'link':
        replacement = `[${selectedText || 'link'}](url)`;
        break;
    }
    editor.executeEdits('toolbar', [{ range: selection, text: replacement, forceMoveMarkers: true }]);
    setDraft(model.getValue());
  };

  return (
    <div className="flex h-full min-h-0 min-w-0">
      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-primary-signal/10 bg-background/80 shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-primary-signal/10 bg-background/70 px-8 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-text-secondary">
              <button onClick={() => handleFormat('bold')} className="rounded-leaf-reverse bg-background/60 p-sm transition-colors hover:text-primary-signal"><Bold size={18} /></button>
              <button onClick={() => handleFormat('italic')} className="rounded-leaf-reverse bg-background/60 p-sm transition-colors hover:text-primary-signal"><Italic size={18} /></button>
              <button onClick={() => handleFormat('list')} className="rounded-leaf-reverse bg-background/60 p-sm transition-colors hover:text-primary-signal"><List size={18} /></button>
              <button onClick={() => handleFormat('link')} className="rounded-leaf-reverse bg-background/60 p-sm transition-colors hover:text-primary-signal"><LinkIcon size={18} /></button>
            </div>
            <div className="h-4 w-px bg-primary-signal/20" />
            <span className="font-mono text-caption text-text-secondary/50">UTF-8</span>
          </div>

          <button
            onClick={() => generateMutation.mutate()}
            className="flex items-center gap-2 rounded-leaf-reverse bg-background/60 px-md py-sm text-caption-bold text-primary-signal transition-opacity hover:opacity-80"
          >
            <RotateCcw size={14} className={isGenerating ? 'animate-spin' : ''} />
            RETRY
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          {activeTab === 'drafts' || activeTab === 'edit' ? (
            <div className="h-full w-full p-2">
              <Editor
                theme="vs-dark"
                defaultLanguage="markdown"
                value={displayedDraft}
                onChange={(v) => setDraft(v ?? '')}
                onMount={handleEditorMount}
                options={{
                  fontSize: 16,
                  fontFamily: 'Pretendard',
                  lineHeight: 24,
                  wordWrap: 'on',
                  minimap: { enabled: false },
                  scrollbar: { vertical: 'auto' },
                  padding: { top: 40, bottom: 100 },
                  lineNumbers: 'on',
                  renderLineHighlight: 'none',
                  quickSuggestions: false,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  readOnly: activeTab === 'drafts',
                }}
              />
            </div>
          ) : (
            <div className="h-full overflow-y-auto px-12 py-10">
              <article className="prose prose-invert max-w-none text-til-body prose-headings:text-primary-signal prose-strong:text-primary-signal">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedDraft}</ReactMarkdown>
              </article>
            </div>
          )}

          {activeTab === 'drafts' && (
            <div className="pointer-events-none absolute left-12 right-12 top-[40%]">
            </div>
          )}

          <div className="absolute bottom-8 right-8">
            <button
              onClick={() => selectedTil && commitMutation.mutate(selectedTil.summaryId)}
              disabled={isCommitting}
              className="flex items-center gap-3 rounded-leaf bg-primary-signal px-8 py-4 text-h2-bold text-background shadow-neon transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isCommitting ? 'Committing...' : 'Commit'}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function isRunning(status?: string) {
  return status === 'PENDING' || status === 'PROCESSING';
}
