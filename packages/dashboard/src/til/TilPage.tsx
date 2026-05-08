import { useState } from 'react';
import { Calendar, GitCommitHorizontal } from 'lucide-react';
import { CollectedDataPanel } from './components/CollectedDataPanel';
import { TILEditor } from './components/TILEditor';
import { useTilPageLogic } from './hooks/useTilPageLogic';
import { TILModeTabs, type TILMode } from './components/TILModeTabs';

export function TilPage() {
    const {
        selectedDate,
        setSelectedDate,
        title,
        setTitle,
        draft,
        setDraft,
        selectedTil,
        sourcesQuery,
        generationStatusQuery,
        commitStatusQuery,
        generateMutation,
        commitMutation,
        generationTone,
        generationMessage,
        commitMessage,
    } = useTilPageLogic();

    const [activeTab, setActiveTab] = useState<TILMode>('drafts');
    const dateLabel = formatDateForDisplay(selectedDate);

    const isCommitting =
        commitMutation.isPending ||
        commitStatusQuery.data?.status === 'PENDING' ||
        commitStatusQuery.data?.status === 'PROCESSING';

    return (
        <section className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-background text-text-primary">
            <div className="no-scrollbar flex min-w-0 flex-1 flex-col overflow-y-auto px-8 pb-8 pt-4">
                <header className="mb-10 flex flex-col gap-6">
                    <h1 className="flex items-baseline gap-1 text-4xl font-extrabold tracking-tight">
                        <span className="text-primary-signal">T</span>
                        <span className="bg-gradient-to-r from-white via-white/90 to-white/40 bg-clip-text text-transparent">
              oday
            </span>
                        <span className="ml-2 text-primary-signal">I</span>
                        <span className="ml-2 text-primary-signal">L</span>
                        <span className="bg-gradient-to-r from-white via-white/90 to-white/40 bg-clip-text text-transparent">
              earned
            </span>
                    </h1>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="group relative flex cursor-pointer items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-5 py-2.5 text-text-secondary transition-all hover:bg-white/10 hover:text-white">
                                <Calendar size={18} className="text-primary-signal" />
                                <span className="text-lg font-semibold tracking-wide">{dateLabel}</span>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />
                            </div>

                            <div className="h-6 w-px bg-white/10" />
                        </div>

                        <div className="flex items-center gap-4">
                            <TILModeTabs activeTab={activeTab} onChange={setActiveTab} />

                            <button
                                type="button"
                                onClick={() => selectedTil && commitMutation.mutate(selectedTil.summaryId)}
                                disabled={isCommitting || !selectedTil}
                                className="flex items-center gap-2.5 rounded-tl-[20px] rounded-br-[20px] rounded-tr-md rounded-bl-md bg-[#238636] px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#2ea043] hover:shadow-primary-signal/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <GitCommitHorizontal size={20} />
                                {isCommitting ? 'Committing...' : 'Commit'}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col gap-8">
                    <div className="px-2">
                        <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary-signal opacity-80">
                            # Today's Knowledge Summary
                        </h2>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="제목을 입력하세요"
                            readOnly={activeTab === 'preview'}
                            className="w-full bg-transparent text-3xl font-extrabold text-white outline-none transition-all placeholder:text-text-secondary/20 focus:placeholder:text-text-secondary/10"
                        />
                    </div>

                    <div className="flex min-h-[500px] flex-col overflow-hidden rounded-2xl border border-white/5 bg-surface-lowest shadow-2xl">
                        <TILEditor
                            activeTab={activeTab}
                            draft={draft}
                            setDraft={setDraft}
                            selectedTil={selectedTil}
                            generateMutation={generateMutation}
                            commitMutation={commitMutation}
                            generationStatusQuery={generationStatusQuery}
                            commitStatusQuery={commitStatusQuery}
                            generationTone={generationTone}
                            generationMessage={generationMessage}
                            commitMessage={commitMessage}
                        />
                    </div>
                </div>
            </div>

            <aside className="no-scrollbar w-[480px] shrink-0 border-l border-white/10 bg-transparent">
                <CollectedDataPanel sourcesQuery={sourcesQuery} selectedTil={selectedTil} />
            </aside>
        </section>
    );
}

function formatDateForDisplay(dateString: string) {
    const date = new Date(dateString);

    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}