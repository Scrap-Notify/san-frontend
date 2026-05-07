import { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { TILMode } from './TILModeTabs';
import { TILToolbar } from './TILToolbar';
import type { TilResponse } from '@san/shared';

interface TILEditorProps {
  activeTab: TILMode;
  draft: string;
  setDraft: (value: string) => void;
  tilList: TilResponse[];
  selectedTil: TilResponse | null;
  setSelectedSummaryId: (summaryId: string | null) => void;
  generateMutation: {
    isPending: boolean;
    mutate: () => void;
    isError?: boolean;
  };
  commitMutation: {
    isPending: boolean;
    mutate: (summaryId: string) => void;
    isError?: boolean;
  };
  generationStatusQuery: {
    data?: { status?: string };
  };
  commitStatusQuery: {
    data?: { status?: string };
  };
}

export function TILEditor({
  activeTab,
  draft,
  setDraft,
  tilList,
  selectedTil,
  setSelectedSummaryId,
  generateMutation,
  commitMutation,
  generationStatusQuery,
  commitStatusQuery,
}: TILEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const SAMPLE_TIL_LIST: TilResponse[] = [
    {
      summaryId: 'sample-1',
      title: 'Quantum Entanglement in Biological Systems',
      content:
        '• **Core Insight:** Research suggests that migratory birds may utilize quantum coherence in their cryptochrome proteins to navigate the Earth’s magnetic field.\n' +
        '• **Analysis:** This quantum compass represents a paradigm shift in how we perceive chemical reactions in living tissue.\n' +
        '• **Implications:** Understanding these mechanisms could unlock new bio-inspired sensing systems and low-energy navigation algorithms.',
      targetDate: '2026-05-06',
      createdAt: '2026-05-06T09:00:00Z',
      updatedAt: '2026-05-06T09:00:00Z',
    },
    {
      summaryId: 'sample-2',
      title: 'AI-Generated Draft: Archive Recall',
      content:
        '• The AI identified a pattern of repeated interest in neural network optimization across the week.\n' +
        '• Suggested follow-up action: document the core concept as a reusable knowledge card.\n' +
        '• Draft note: emphasize the connection between model interpretability and training stability.',
      targetDate: '2026-05-06',
      createdAt: '2026-05-06T09:20:00Z',
      updatedAt: '2026-05-06T09:20:00Z',
    },
  ];

  const visibleTilList = tilList.length > 0 ? tilList : SAMPLE_TIL_LIST;
  const visibleSelectedTil = selectedTil ?? visibleTilList[0] ?? null;
  const draftContent = visibleSelectedTil?.content ?? '';
  const displayedDraft = draft || (visibleSelectedTil?.content ?? '');

  const isGenerating = generateMutation.isPending || isRunning(generationStatusQuery.data?.status);
  const isCommitting = commitMutation.isPending || isRunning(commitStatusQuery.data?.status);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
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
        replacement = `**${selectedText || '강조할 텍스트'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || '기울임 텍스트'}*`;
        break;
      case 'list':
        replacement = (selectedText || '목록 아이템')
          .split('\n')
          .map((line) => `- ${line}`)
          .join('\n');
        break;
      case 'link':
        replacement = `[${selectedText || '링크 텍스트'}](https://example.com)`;
        break;
    }

    editor.executeEdits('markdown-toolbar', [
      {
        range: selection,
        text: replacement,
        forceMoveMarkers: true,
      },
    ]);

    const value = model.getValue();
    setDraft(value);
    editor.focus();
  };

  return (
    <main className="flex min-w-0 flex-col rounded-leaf bg-background">
      <TILToolbar
        onReset={() => setDraft(visibleSelectedTil?.content ?? '')}
        onGenerate={() => generateMutation.mutate()}
        onCommit={() => {
          if (selectedTil) {
            commitMutation.mutate(selectedTil.summaryId);
          }
        }}
        onFormat={handleFormat}
        isGenerating={isGenerating}
        isCommitting={isCommitting}
      />

      {activeTab === 'drafts' && (
        <div className="grid min-h-0 flex-1 gap-dashboard-gap overflow-hidden lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="rounded-leaf border border-primary-signal/20 bg-surface-low p-md shadow-neon-sm">
            <div className="mb-md border-b border-primary-signal/20 pb-sm text-body-sm-bold uppercase tracking-wide text-primary-signal">
              AI Generated Drafts
            </div>
            {visibleTilList.length === 0 ? (
              <div className="rounded-leaf bg-surface-container px-md py-lg text-body-sm text-text-secondary">
                아직 생성된 TIL이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {visibleTilList.map((til) => (
                  <button
                    key={til.summaryId}
                    type="button"
                    onClick={() => setSelectedSummaryId(til.summaryId)}
                    className={
                      `w-full rounded-leaf border px-md py-md text-left transition-all duration-200 hover:glow-neon ` +
                      (til.summaryId === visibleSelectedTil?.summaryId
                        ? 'border-primary-signal bg-primary-signal/10 text-text-primary shadow-neon-sm'
                        : 'border-primary-signal/10 bg-surface-container text-text-secondary hover:border-primary-signal/50 hover:bg-surface-highest')
                    }
                  >
                    <div className="text-body-sm-bold text-text-primary">
                      {til.title || 'Untitled TIL'}
                    </div>
                    <p className="mt-sm line-clamp-3 text-caption text-text-secondary">
                      {til.content}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-leaf bg-surface-low p-lg shadow-neon-sm">
            <div className="mb-lg flex items-center justify-between gap-md rounded-leaf border border-primary-signal/20 bg-surface-container/80 px-lg py-md text-body-sm text-text-secondary">
              <div>
                <div className="text-caption-bold uppercase tracking-wide text-primary-signal">Selected Draft</div>
                <div className="mt-sm text-body-lg-bold text-text-primary">
                  {selectedTil?.title || '선택된 draft가 없습니다.'}
                </div>
              </div>
              <div className="rounded-leaf border border-primary-signal/20 bg-primary-signal/10 px-md py-xs text-caption-bold uppercase tracking-wide text-primary-signal">
                Read Only
              </div>
            </div>
            <div className="flex min-h-0 flex-1 overflow-hidden rounded-leaf border border-primary-signal/20 bg-surface-container p-sm">
              <Editor
                theme="vs-dark"
                defaultLanguage="markdown"
                value={draftContent}
                onMount={handleEditorMount}
                options={{
                  wordWrap: 'on',
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  readOnly: true,
                  padding: { top: 14, bottom: 14 },
                }}
                className="h-full w-full rounded-leaf bg-surface-container"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'edit' && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-leaf bg-surface-low p-lg shadow-neon-sm">
          <div className="mb-lg flex items-center justify-between gap-md rounded-leaf border border-primary-signal/20 bg-surface-container/80 px-lg py-md text-body-sm text-text-secondary">
            <div>
              <div className="text-caption-bold uppercase tracking-wide text-primary-signal">Editing Draft</div>
              <div className="mt-sm text-body-lg-bold text-text-primary">
                {visibleSelectedTil?.title || 'Untitled TIL'}
              </div>
            </div>
            <div className="rounded-leaf border border-primary-signal/20 bg-primary-signal/10 px-md py-xs text-caption-bold uppercase tracking-wide text-primary-signal">
              Editable
            </div>
          </div>
          <div className="flex min-h-0 flex-1 overflow-hidden rounded-leaf border border-primary-signal/20 bg-surface-container p-sm">
            <Editor
              theme="vs-dark"
              defaultLanguage="markdown"
              value={displayedDraft}
              onChange={(value) => setDraft(value ?? visibleSelectedTil?.content ?? '')}
              onMount={handleEditorMount}
              options={{
                wordWrap: 'on',
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 14, bottom: 14 },
              }}
              className="h-full w-full rounded-leaf bg-surface-container"
            />
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-leaf bg-surface-low p-lg shadow-neon-sm">
          <div className="mb-lg flex items-center justify-between gap-md rounded-leaf border border-primary-signal/20 bg-surface-container/80 px-lg py-md text-body-sm text-text-secondary">
            <div>
              <div className="text-caption-bold uppercase tracking-wide text-primary-signal">Preview Draft</div>
              <div className="mt-sm text-body-lg-bold text-text-primary">
                {visibleSelectedTil?.title || 'Untitled TIL'}
              </div>
            </div>
            <div className="rounded-leaf border border-primary-signal/20 bg-primary-signal/10 px-md py-xs text-caption-bold uppercase tracking-wide text-primary-signal">
              Preview
            </div>
          </div>
          <div className="flex min-h-0 flex-1 overflow-hidden rounded-leaf border border-primary-signal/20 bg-surface-container p-lg">
            <div className="prose prose-invert max-w-none overflow-y-auto text-text-primary prose-headings:text-text-primary prose-p:text-text-secondary prose-code:bg-surface-highest prose-code:text-primary-signal prose-pre:bg-background prose-a:text-primary-signal prose-a:no-underline hover:prose-a:underline">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedDraft || '미리보기할 TIL이 없습니다.'}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function isRunning(status?: string) {
  return status === 'PENDING' || status === 'PROCESSING';
}
