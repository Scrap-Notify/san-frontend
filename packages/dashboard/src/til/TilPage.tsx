import { useState } from 'react';
import { ChevronLeft, ChevronRight, GitCommitHorizontal } from 'lucide-react';
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

    const goToPrevDate = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - 1);
        setSelectedDate(shiftDate(date));
    };

    const today = shiftDate(new Date());
    const isToday = selectedDate >= today;

    const goToNextDate = () => {
        if (isToday) return;
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + 1);
        setSelectedDate(shiftDate(date));
    };

    const isCommitting =
        commitMutation.isPending ||
        commitStatusQuery.data?.status === 'PENDING' ||
        commitStatusQuery.data?.status === 'PROCESSING';

    return (
        <section className="flex h-[calc(100vh-80px)] w-full min-w-[900px] overflow-hidden bg-background text-text-primary"
        >
            <div className="no-scrollbar flex min-w-0 flex-1 flex-col overflow-y-auto px-6 pb-6 pt-3">
                <header className="mb-6 flex flex-col gap-3">
                    <h1 className="flex items-baseline gap-1 text-2xl font-extrabold tracking-tight">
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
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 rounded-xl border border-white/5 bg-white/5 px-2 py-1.5">
                                <button
                                    type="button"
                                    onClick={goToPrevDate}
                                    className="rounded p-0.5 text-text-secondary transition-colors hover:text-white"
                                    aria-label="이전 날짜"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <span className="min-w-[110px] text-center text-sm font-semibold tracking-wide text-white">
                                    {dateLabel}
                                </span>
                                <button
                                    type="button"
                                    onClick={goToNextDate}
                                    disabled={isToday}
                                    className="rounded p-0.5 text-text-secondary transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                                    aria-label="다음 날짜"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>

                            <div className="h-4 w-px bg-white/10" />
                        </div>

                        <div className="flex items-center gap-3">
                            <TILModeTabs activeTab={activeTab} onChange={setActiveTab} />

                            <button
                                type="button"
                                onClick={() => selectedTil && commitMutation.mutate(selectedTil.summaryId)}
                                disabled={isCommitting || !selectedTil}
                                className="flex h-11 w-30 items-center justify-center gap-2 rounded-tl-[14px] rounded-br-[14px] rounded-tr-md rounded-bl-md bg-[#238636] px-4 text-sm font-medium text-white shadow-lg transition-all hover:bg-[#2ea043] hover:shadow-primary-signal/20 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                <GitCommitHorizontal size={16} />
                                {isCommitting ? 'Committing...' : 'Commit'}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex min-h-0 flex-1 flex-col gap-4">
                    <div className="px-1">
                        <h2 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary-signal opacity-80">
                            # Today's Knowledge Summary
                        </h2>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="제목을 입력하세요"
                            readOnly={activeTab === 'preview'}
                            className="w-full bg-transparent text-xl font-extrabold text-white outline-none transition-all placeholder:text-text-secondary/20 focus:placeholder:text-text-secondary/10"
                        />
                    </div>

                    <div className="flex min-h-[600px] flex-1 flex-col rounded-2xl border border-white/5 bg-surface-lowest shadow-2xl">
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

            <aside className="no-scrollbar w-[360px] shrink-0 border-l border-white/10 bg-transparent">
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

function shiftDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}