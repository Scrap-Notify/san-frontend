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
    <main className="flex min-w-0 flex-col bg-[#0b0f12]">
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
        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[18rem_minmax(0,1fr)] gap-4">
          <aside className="rounded-[1.75rem] border border-[#0d221a] bg-[#04110f] p-4 shadow-[0_0_30px_rgba(0,255,194,0.08)]">
            <div className="mb-4 border-b border-[#0c3225] pb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#00ffc2]">
              AI Generated Drafts
            </div>
            {visibleTilList.length === 0 ? (
              <div className="rounded-3xl bg-[#071413] px-4 py-5 text-sm text-[#9fc2b5]">
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
                      `w-full rounded-[1.5rem] border px-4 py-4 text-left transition-all duration-200 ` +
                      (til.summaryId === visibleSelectedTil?.summaryId
                        ? 'border-[#00ffc2] bg-[#00ffc2]/10 text-[#fbfffa] shadow-[0_0_0_1px_rgba(0,255,194,0.18)]'
                        : 'border-[#11332a] bg-[#081214] text-[#b9cbc1] hover:border-[#00ffc2]/50 hover:bg-[#0b1816]')
                    }
                  >
                    <div className="text-sm font-semibold leading-5 text-[#e8fffb]">
                      {til.title || 'Untitled TIL'}
                    </div>
                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#96bfb3]">
                      {til.content}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] bg-[#04110f] p-5 shadow-[0_0_40px_rgba(0,255,194,0.06)]">
            <div className="mb-5 flex items-center justify-between gap-4 rounded-3xl border border-[#0a2f22] bg-[#061210]/80 px-5 py-4 text-sm text-[#b9cbc1]">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-[#7ef6c6]">Selected Draft</div>
                <div className="mt-2 text-lg font-semibold text-[#fbfffa]">
                  {selectedTil?.title || '선택된 draft가 없습니다.'}
                </div>
              </div>
              <div className="rounded-full border border-[#00ffc2]/20 bg-[#00ffc2]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#00ffc2]">
                Read Only
              </div>
            </div>
            <div className="flex min-h-0 flex-1 overflow-hidden rounded-[1.5rem] border border-[#0c261f] bg-[#071415] p-3">
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
                className="h-full w-full rounded-[1.5rem] bg-[#071415]"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'edit' && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] bg-[#04110f] p-5 shadow-[0_0_40px_rgba(0,255,194,0.06)]">
          <div className="mb-5 flex items-center justify-between gap-4 rounded-3xl border border-[#0a2f22] bg-[#061210]/80 px-5 py-4 text-sm text-[#b9cbc1]">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-[#7ef6c6]">Editing Draft</div>
              <div className="mt-2 text-lg font-semibold text-[#fbfffa]">
                {visibleSelectedTil?.title || 'Untitled TIL'}
              </div>
            </div>
            <div className="rounded-full border border-[#00ffc2]/20 bg-[#00ffc2]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#00ffc2]">
              Editable
            </div>
          </div>
          <div className="flex min-h-0 flex-1 overflow-hidden rounded-[1.5rem] border border-[#0c261f] bg-[#071415] p-3">
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
              className="h-full w-full rounded-[1.5rem] bg-[#071415]"
            />
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] bg-[#04110f] p-5 shadow-[0_0_40px_rgba(0,255,194,0.06)]">
          <div className="mb-5 flex items-center justify-between gap-4 rounded-3xl border border-[#0a2f22] bg-[#061210]/80 px-5 py-4 text-sm text-[#b9cbc1]">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-[#7ef6c6]">Preview Draft</div>
              <div className="mt-2 text-lg font-semibold text-[#fbfffa]">
                {visibleSelectedTil?.title || 'Untitled TIL'}
              </div>
            </div>
            <div className="rounded-full border border-[#00ffc2]/20 bg-[#00ffc2]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#00ffc2]">
              Preview
            </div>
          </div>
          <div className="flex min-h-0 flex-1 overflow-hidden rounded-[1.5rem] border border-[#0c261f] bg-[#071415] p-6">
            <div className="prose prose-invert max-w-none overflow-y-auto text-[#fbfffa] prose-headings:text-[#fbfffa] prose-p:text-[#d0d7d9] prose-code:bg-[#11171b] prose-code:text-[#00ffc2] prose-pre:bg-[#020608] prose-a:text-[#00ffc2] prose-a:no-underline hover:prose-a:underline">
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