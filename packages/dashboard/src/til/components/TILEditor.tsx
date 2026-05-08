import { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bold, Italic, List, Link as LinkIcon, RotateCcw, ArrowRight } from 'lucide-react';
import type { TILMode } from '@dashboard/til/components/TILModeTabs';
import type { TilResponse } from '@san/shared';
import type { TilGenerateMutation, TilGithubCommitMutation, TilJobStatusQuery } from '@dashboard/til/types';

interface TILEditorProps {
  activeTab: TILMode;
  draft: string;
  setDraft: (value: string) => void;
  selectedTil: TilResponse | null;
  generateMutation: TilGenerateMutation;
  commitMutation: TilGithubCommitMutation;
  generationStatusQuery: TilJobStatusQuery;
  commitStatusQuery: TilJobStatusQuery;
  generationMessage: string | null;
  commitMessage: string | null;
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
  generationMessage,
  commitMessage,
}: TILEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const isGenerating = generateMutation.isPending || isRunning(generationStatusQuery.data?.status);
  const isCommitting = commitMutation.isPending || isRunning(commitStatusQuery.data?.status);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const displayedDraft = draft || (selectedTil?.content ?? '');

  const handleGenerate = () => {
    if (isGenerating) return;
    generateMutation.mutate();
  };

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
              <button type="button" onClick={() => handleFormat('bold')} className="rounded-leaf-reverse bg-background/60 p-sm transition-colors hover:text-primary-signal"><Bold size={18} /></button>
              <button type="button" onClick={() => handleFormat('italic')} className="rounded-leaf-reverse bg-background/60 p-sm transition-colors hover:text-primary-signal"><Italic size={18} /></button>
              <button type="button" onClick={() => handleFormat('list')} className="rounded-leaf-reverse bg-background/60 p-sm transition-colors hover:text-primary-signal"><List size={18} /></button>
              <button type="button" onClick={() => handleFormat('link')} className="rounded-leaf-reverse bg-background/60 p-sm transition-colors hover:text-primary-signal"><LinkIcon size={18} /></button>
            </div>
            <div className="h-4 w-px bg-primary-signal/20" />
            <span className="font-mono text-caption text-text-secondary/50">UTF-8</span>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-leaf-reverse bg-background/60 px-md py-sm text-caption-bold text-primary-signal transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw size={14} className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating ? 'GENERATING...' : 'RETRY'}
          </button>
        </div>

        {(generationMessage || commitMessage) ? (
          <div className="shrink-0 border-b border-primary-signal/10 bg-surface-low/60 px-8 py-2 text-caption text-text-secondary">
            {generationMessage ?? commitMessage}
          </div>
        ) : null}

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
              <article className="max-w-none text-til-body text-text-primary">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="mb-6 border-b border-primary-signal/20 pb-4 text-3xl font-bold leading-tight text-primary-signal">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-4 mt-8 text-2xl font-bold leading-tight text-primary-signal">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-3 mt-6 text-xl font-semibold leading-snug text-text-primary">
                        {children}
                      </h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="mb-2 mt-5 text-lg font-semibold leading-snug text-text-primary">
                        {children}
                      </h4>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 leading-7 text-text-primary/90">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-5 list-disc space-y-2 pl-6 text-text-primary/90">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-5 list-decimal space-y-2 pl-6 text-text-primary/90">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="pl-1 leading-7 marker:text-primary-signal">
                        {children}
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-primary-signal">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="text-text-secondary">
                        {children}
                      </em>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="mb-5 border-l-2 border-primary-signal/50 bg-primary-signal/5 py-3 pl-4 text-text-secondary">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="rounded bg-surface-highest px-1.5 py-0.5 font-mono text-sm text-primary-signal">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="mb-5 overflow-x-auto rounded-[8px] border border-primary-signal/10 bg-surface-low p-4 text-sm leading-6">
                        {children}
                      </pre>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-signal underline decoration-primary-signal/40 underline-offset-4"
                      >
                        {children}
                      </a>
                    ),
                    hr: () => <hr className="my-8 border-primary-signal/20" />,
                  }}
                >
                  {displayedDraft}
                </ReactMarkdown>
              </article>
            </div>
          )}

          <div className="absolute bottom-8 right-8">
            <button
              type="button"
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
