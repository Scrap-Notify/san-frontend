/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bold, Italic, List, Link as LinkIcon, RotateCcw, Heading, Quote, Code, ListOrdered, ListChecks } from 'lucide-react';
import type { TILMode } from '@dashboard/til/components/TILModeTabs';
import type { TilResponse } from '@san/shared';
import type {
    TilGenerateMutation,
    TilGithubCommitMutation,
    TilJobStatusQuery,
    TilJobTone,
} from '@dashboard/til/types';

interface TILEditorProps {
    activeTab: TILMode;
    draft: string;
    setDraft: (value: string) => void;
    selectedTil: TilResponse | null;
    generateMutation: TilGenerateMutation;
    commitMutation: TilGithubCommitMutation;
    generationStatusQuery: TilJobStatusQuery;
    commitStatusQuery: TilJobStatusQuery;
    generationTone: TilJobTone;
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
                              generationTone,
                              generationMessage,
                              commitMessage,
                          }: TILEditorProps) {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [editorHeight, setEditorHeight] = useState(500);

    const isGenerating = generateMutation.isPending || isRunning(generationStatusQuery.data?.status);

    const displayedDraft = draft || (selectedTil?.content ?? '');

    const handleEditorMount: OnMount = (editor) => {
        editorRef.current = editor;
        // 초기 높이 계산
        const lineCount = editor.getModel()?.getLineCount() ?? 20;
        setEditorHeight(Math.max(500, lineCount * 24 + 80));
        // 컨텐츠 변경 시 높이 자동 조정
        editor.onDidContentSizeChange((e) => {
            const newHeight = Math.max(500, e.contentHeight + 80);
            setEditorHeight(newHeight);
        });
    };

    const handleGenerate = () => {
        if (isGenerating) return;
        generateMutation.mutate();
    };



    const handleFormat = (action: 'heading' | 'bold' | 'italic' | 'quote' | 'code' | 'link' | 'ordered-list' | 'list' | 'task') => {
        const editor = editorRef.current;
        if (!editor) return;

        const model = editor.getModel();
        const selection = editor.getSelection();
        if (!model || !selection) return;

        const selectedText = model.getValueInRange(selection);

        let replacement = selectedText;
        switch (action) {
            case 'heading':
                replacement = `### ${selectedText || 'Heading'}`;
                break;
            case 'bold':
                replacement = `**${selectedText || 'text'}**`;
                break;
            case 'italic':
                replacement = `*${selectedText || 'text'}*`;
                break;
            case 'quote':
                replacement = `\n> ${selectedText || 'quote'}`;
                break;
            case 'code':
                replacement = selectedText.includes('\n')
                    ? `\`\`\`\n${selectedText || 'code'}\n\`\`\``
                    : `\`${selectedText || 'code'}\``;
                break;
            case 'link':
                replacement = `[${selectedText || 'link'}](url)`;
                break;
            case 'ordered-list':
                replacement = `\n1. ${selectedText || 'item'}`;
                break;
            case 'list':
                replacement = `\n- ${selectedText || 'item'}`;
                break;
            case 'task':
                replacement = `\n- [ ] ${selectedText || 'task'}`;
                break;
        }

        editor.executeEdits('toolbar', [
            { range: selection, text: replacement, forceMoveMarkers: true },
        ]);

        setDraft(model.getValue());
    };

    const statusMessage = generationMessage ?? commitMessage;

    return (
        <div className="flex min-h-0 w-full flex-col">
            <main className="relative flex w-full flex-col bg-transparent">
                <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-4 py-2.5">
                    <div className="flex items-center gap-3 text-text-secondary">
                        {/* 그룹 1: 텍스트 서식 */}
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => handleFormat('heading')} title="Heading" className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-white/10 hover:text-white">
                                <Heading size={13} strokeWidth={2} />
                            </button>
                            <button type="button" onClick={() => handleFormat('bold')} title="Bold" className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-white/10 hover:text-white">
                                <Bold size={13} strokeWidth={2.5} />
                            </button>
                            <button type="button" onClick={() => handleFormat('italic')} title="Italic" className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-white/10 hover:text-white">
                                <Italic size={13} strokeWidth={2.5} />
                            </button>
                            <button type="button" onClick={() => handleFormat('quote')} title="Quote" className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-white/10 hover:text-white">
                                <Quote size={13} strokeWidth={2} />
                            </button>
                            <button type="button" onClick={() => handleFormat('code')} title="Code" className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-white/10 hover:text-white">
                                <Code size={13} strokeWidth={2} />
                            </button>
                            <button type="button" onClick={() => handleFormat('link')} title="Link" className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-white/10 hover:text-white">
                                <LinkIcon size={13} strokeWidth={2} />
                            </button>
                        </div>

                        <div className="h-3 w-px bg-white/10" />

                        {/* 그룹 2: 리스트 */}
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => handleFormat('ordered-list')} title="Ordered List" className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-white/10 hover:text-white">
                                <ListOrdered size={13} strokeWidth={2} />
                            </button>
                            <button type="button" onClick={() => handleFormat('list')} title="Unordered List" className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-white/10 hover:text-white">
                                <List size={13} strokeWidth={2} />
                            </button>
                            <button type="button" onClick={() => handleFormat('task')} title="Task List" className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-white/10 hover:text-white">
                                <ListChecks size={13} strokeWidth={2} />
                            </button>
                        </div>

                        <div className="h-4 w-px bg-white/10" />

                        {statusMessage ? (
                            <div
                                className={`flex items-center gap-2 rounded-full border px-3 py-1 ${
                                    generationTone === 'success'
                                        ? 'border-primary-signal/30 bg-primary-signal/10 text-primary-signal'
                                        : generationTone === 'error'
                                            ? 'border-error/30 bg-error/10 text-error'
                                            : generationTone === 'pending'
                                                ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500'
                                                : 'border-white/10 bg-white/5 text-text-secondary'
                                }`}
                            >
                                <span className="text-xs font-bold">{statusMessage}</span>
                            </div>
                        ) : null}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium text-text-secondary">
                        <span>UTF-8</span>

                        <div className="h-4 w-px bg-white/10" />

                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="flex items-center gap-1.5 font-bold text-primary-signal transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RotateCcw size={14} className={isGenerating ? 'animate-spin' : ''} />
                            {isGenerating ? 'GENERATING...' : 'REGENERATE'}
                        </button>
                    </div>
                </div>

                <div className="relative w-full pt-2">
                    {activeTab === 'drafts' || activeTab === 'edit' ? (
                        <div style={{ height: editorHeight }} className="w-full">
                            <Editor
                                theme="vs-dark"
                                defaultLanguage="markdown"
                                value={displayedDraft}
                                onChange={(v) => setDraft(v ?? '')}
                                onMount={handleEditorMount}
                                options={{
                                    fontSize: 15,
                                    fontFamily: 'Pretendard, ui-monospace, monospace',
                                    lineHeight: 26,
                                    wordWrap: 'on',
                                    minimap: { enabled: false },
                                    scrollbar: { vertical: 'hidden', horizontal: 'hidden', handleMouseWheel: false },
                                    padding: { top: 16, bottom: 40 },
                                    lineNumbers: 'on',
                                    renderLineHighlight: 'all',
                                    quickSuggestions: false,
                                    automaticLayout: true,
                                    scrollBeyondLastLine: false,
                                    readOnly: activeTab === 'preview',
                                    overviewRulerLanes: 0,
                                }}
                            />
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto px-10 py-8 no-scrollbar">
                            <article className="max-w-none leading-relaxed text-text-primary">
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
                                            <p className="mb-4 leading-7 text-text-primary/90">{children}</p>
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
                                            <li className="pl-1 leading-7 marker:text-primary-signal">{children}</li>
                                        ),
                                        strong: ({ children }) => (
                                            <strong className="font-bold text-primary-signal">{children}</strong>
                                        ),
                                        em: ({ children }) => (
                                            <em className="text-text-secondary">{children}</em>
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
                </div>
            </main>
        </div>
    );
}

function isRunning(status?: string) {
    return status === 'PENDING' || status === 'PROCESSING';
}