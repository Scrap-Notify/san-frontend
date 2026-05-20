import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, PackageOpen, Search, X } from 'lucide-react';
import type { TilResponse, TilSourceContentResponse } from '@san/shared';
import type { TilRecallCardsQuery, TilSourcesQuery } from '../types';
import { CollectedDataCard, type CollectedDataItem } from './CollectedDataCard';
import { RecallHistory } from './RecallHistory';

const EMPTY_SOURCES: TilSourceContentResponse[] = [];
const REVIEW_STATUS_TITLE = '\uBCF5\uC2B5 \uD604\uD669';
const REVIEW_COMPLETE_DESCRIPTION = 'Recall \uD034\uC988 \uC81C\uCD9C \uAE30\uB85D\uC774 \uC788\uC5B4\uC694.';
const REVIEW_PENDING_DESCRIPTION = 'Recall \uD034\uC988\uB97C \uD480\uBA74 \uBCF5\uC2B5 \uC644\uB8CC\uB85C \uD45C\uC2DC\uB429\uB2C8\uB2E4.';
const REVIEW_SOLVED_LABEL = '\uD480\uC774 \uD604\uD669';
const REVIEW_CORRECT_LABEL = '\uC815\uB2F5 \uC218';
const REVIEW_STATUS_LABEL = '\uC0C1\uD0DC';
const REVIEW_SUBMITTED_LABEL = '\uC81C\uCD9C \uC644\uB8CC';
const REVIEW_EMPTY_TITLE = '\uC544\uC9C1 \uCE74\uB4DC\uAC00 \uC5C6\uC5B4\uC694';
const REVIEW_EMPTY_DESCRIPTION = 'TIL\uC744 \uC0DD\uC131\uD558\uBA74 \uBCF5\uC2B5 \uD604\uD669\uC774 \uC774\uACF3\uC5D0 \uD45C\uC2DC\uB3FC\uC694.';
const REVIEW_NO_QUIZ_LABEL = '\uBCF5\uC2B5\uD560 \uD034\uC988\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.';
const QUIZ_MODAL_TITLE = 'Recall \uD034\uC988';
const QUIZ_MODAL_DESCRIPTION = '\uC120\uD0DD\uD55C TIL\uC744 \uAE30\uBC18\uC73C\uB85C \uBCF5\uC2B5 \uBB38\uC81C\uB97C \uD480\uC5B4\uBCF4\uC138\uC694.';
const QUIZ_CLOSE_LABEL = '\uB2EB\uAE30';
const QUIZ_SUBMIT_LABEL = '\uC815\uB2F5 \uD655\uC778';
const QUIZ_NEXT_LABEL = '\uB2E4\uC74C \uBB38\uC81C';
const QUIZ_DONE_LABEL = '\uC644\uB8CC';
const QUIZ_CORRECT_LABEL = '\uC815\uB2F5\uC774\uC5D0\uC694';
const QUIZ_INCORRECT_LABEL = '\uB2E4\uC2DC \uD655\uC778\uD574\uBCF4\uC138\uC694';
const MOCK_REVIEW_QUIZZES = [
    {
        id: 'mock-quiz-1',
        question: 'TIL\uC5D0\uC11C \uC815\uB9AC\uD55C \uD575\uC2EC \uAC1C\uB150\uC740 \uC2E4\uC81C \uC0AC\uB840\uC640 \uD568\uAED8 \uC774\uD574\uD558\uB294 \uAC83\uC774 \uC88B\uB2E4.',
        answer: 'O',
        explanation: '\uD575\uC2EC \uAC1C\uB150\uC744 \uC0AC\uB840\uC640 \uC5F0\uACB0\uD558\uBA74 \uB2E4\uC74C\uC5D0 \uB354 \uBE60\uB974\uAC8C \uB5A0\uC62C\uB9B4 \uC218 \uC788\uC5B4\uC694.',
        solved: true,
        correct: true,
    },
    {
        id: 'mock-quiz-2',
        question: '\uC624\uB298 \uBCF5\uC2B5\uD560 \uCE74\uB4DC\uB294 TIL\uACFC \uAD00\uB828 \uC5C6\uB294 \uC784\uC758\uC758 \uCE74\uB4DC\uB9CC \uC120\uD0DD\uB41C\uB2E4.',
        answer: 'X',
        explanation: 'Recall\uC740 \uC120\uD0DD\uB41C TIL\uACFC \uC5F0\uACB0\uB41C \uCE74\uB4DC\uB97C \uAE30\uBC18\uC73C\uB85C \uBCF5\uC2B5 \uD750\uB984\uC744 \uB9CC\uB4DC\uB294 \uC601\uC5ED\uC785\uB2C8\uB2E4.',
        solved: true,
        correct: false,
    },
    {
        id: 'mock-quiz-3',
        question: 'TIL\uC744 \uC0DD\uC131\uD55C \uB4A4\uC5D0\uB3C4 \uBCF5\uC2B5 \uD034\uC988\uB97C \uD1B5\uD574 \uAE30\uC5B5\uC744 \uB2E4\uC2DC \uC810\uAC80\uD560 \uC218 \uC788\uB2E4.',
        answer: 'O',
        explanation: '\uD034\uC988\uB294 TIL\uC744 \uC77D\uB294 \uAC83\uC5D0\uC11C \uB05D\uB098\uC9C0 \uC54A\uACE0 \uAE30\uC5B5\uC744 \uC7AC\uD655\uC778\uD558\uB294 \uC7A5\uCE58\uB85C \uC0AC\uC6A9\uB429\uB2C8\uB2E4.',
        solved: false,
        correct: null,
    },
] as const;

interface CollectedDataPanelProps {
    sourcesQuery: TilSourcesQuery;
    recallCardsQuery: TilRecallCardsQuery;
    selectedTil: TilResponse | null;
}

type PanelTab = 'sources' | 'recall';

export function CollectedDataPanel({ sourcesQuery, recallCardsQuery, selectedTil }: CollectedDataPanelProps) {
    const [activeTab, setActiveTab] = useState<PanelTab>('recall');
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);
    const sources = sourcesQuery.data?.sources ?? EMPTY_SOURCES;
    const recallCount = recallCardsQuery.data?.recallCards.length ?? 0;

    const items: CollectedDataItem[] = useMemo(() => {
        const baseItems = sources.map((source) => ({
            id: source.scrapId,
            type: toCollectedDataType(source.sourceType),
            title: source.title,
            timeLabel: new Date(source.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
            excerpt: source.rawContent || source.sourceUrl || '',
            tag: source.category?.categoryName ? `# ${source.category.categoryName}` : '',
            imageUrl: source.imageUrl ?? undefined,
            href: source.sourceUrl ?? undefined,
        }));

        if (!debouncedSearch) return baseItems;

        const lowerSearch = debouncedSearch.toLowerCase();
        return baseItems.filter((item) =>
            item.title.toLowerCase().includes(lowerSearch) ||
            item.excerpt.toLowerCase().includes(lowerSearch) ||
            item.tag.toLowerCase().includes(lowerSearch)
        );
    }, [sources, debouncedSearch]);

    return (
        <aside className="flex h-full w-full flex-col overflow-hidden bg-transparent">
            <ReviewStatusSummary
                recallCount={recallCount}
                selectedTil={selectedTil}
            />

            <header className="flex shrink-0 items-center gap-2 border-b border-text-secondary/5 p-3">
                <PanelTabButton
                    active={activeTab === 'recall'}
                    badge={recallCount}
                    label="Recall"
                    onClick={() => setActiveTab('recall')}
                />
                <PanelTabButton
                    active={activeTab === 'sources'}
                    label="Source"
                    onClick={() => setActiveTab('sources')}
                />
            </header>

            {activeTab === 'sources' ? (
                <>
                    <div className="border-b border-text-secondary/5 p-4">
                        <label className="flex items-center gap-2 rounded-full bg-surface-highest px-4 py-2 transition focus-within:ring-1 focus-within:ring-primary-signal/30">
                            <Search size={16} className="text-text-secondary" />
                            <input
                                type="search"
                                placeholder="키워드로 검색..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary/60"
                            />
                        </label>
                    </div>

                    <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
                        {sourcesQuery.isPending && selectedTil && !import.meta.env.DEV ? (
                            <div className="py-10 text-center text-sm italic text-text-secondary opacity-50">
                                수집 데이터를 불러오는 중...
                            </div>
                        ) : null}

                        {items.map((item) => (
                            <CollectedDataCard key={item.id} item={item} />
                        ))}

                        {selectedTil && !sourcesQuery.isPending && items.length === 0 ? (
                            <div className="py-10 text-center text-sm italic text-text-secondary opacity-50">
                                {debouncedSearch ? '검색 결과가 없습니다.' : '수집 데이터가 없습니다.'}
                            </div>
                        ) : null}
                    </div>
                </>
            ) : (
                <RecallHistory
                    recallCardsQuery={recallCardsQuery}
                    selectedTil={selectedTil}
                    variant="panel"
                />
            )}
        </aside>
    );
}

function ReviewStatusSummary({
    recallCount,
    selectedTil,
}: {
    recallCount: number;
    selectedTil: TilResponse | null;
}) {
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const quizzes = selectedTil && recallCount > 0 ? MOCK_REVIEW_QUIZZES : [];
    const solvedQuizCount = quizzes.filter((quiz) => quiz.solved).length;
    const correctQuizCount = quizzes.filter((quiz) => quiz.correct === true).length;
    const reviewed = solvedQuizCount > 0;
    const solvedLabel = quizzes.length > 0 ? `${solvedQuizCount}/${quizzes.length}` : '0/0';

    return (
        <>
            <section className="shrink-0 border-b border-text-secondary/5 px-5 pb-5">
                {selectedTil ? (
                    quizzes.length > 0 ? (
                        <button
                            type="button"
                            onClick={() => setIsQuizModalOpen(true)}
                            className="block w-full rounded-lg text-left transition hover:bg-text-primary/[0.025] focus:outline-none focus:ring-1 focus:ring-primary-signal/30"
                        >
                            <div className="px-1 py-1">
                                <header className="flex items-start">
                                    <div className="min-w-0">
                                        <p className="text-sm font-extrabold text-text-primary">
                                            {REVIEW_STATUS_TITLE}
                                        </p>
                                        <p className="mt-1 text-xs leading-relaxed text-text-secondary/75">
                                            {reviewed ? REVIEW_COMPLETE_DESCRIPTION : REVIEW_PENDING_DESCRIPTION}
                                        </p>
                                    </div>
                                </header>

                                <div className="mt-5 rounded-lg border border-text-secondary/8 bg-surface-highest/40 p-4">
                                    <dl className="space-y-3 text-xs">
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-text-secondary/65">{REVIEW_SOLVED_LABEL}</dt>
                                            <dd className="font-bold text-text-primary">{solvedLabel}</dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-text-secondary/65">{REVIEW_CORRECT_LABEL}</dt>
                                            <dd className="font-bold text-text-primary">{correctQuizCount}</dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-text-secondary/65">{REVIEW_STATUS_LABEL}</dt>
                                            <dd className="font-bold text-text-primary">{reviewed ? REVIEW_SUBMITTED_LABEL : '-'}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </button>
                    ) : (
                        <div className="rounded-lg border border-text-secondary/8 bg-surface-highest/40 p-4">
                            <header className="flex items-start">
                                <div className="min-w-0">
                                    <p className="text-sm font-extrabold text-text-primary">
                                        {REVIEW_STATUS_TITLE}
                                    </p>
                                    <p className="mt-1 text-xs leading-relaxed text-text-secondary/75">
                                        {REVIEW_NO_QUIZ_LABEL}
                                    </p>
                                </div>
                            </header>
                        </div>
                    )
                ) : (
                    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 pt-6 text-center">
                        <div className="til-light-teal-accent text-action-accent/80 drop-shadow-[0_0_18px_rgba(119,255,210,0.22)]">
                            <PackageOpen size={44} strokeWidth={1.6} aria-hidden="true" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-body-sm font-medium text-text-secondary">
                                {REVIEW_EMPTY_TITLE}
                            </p>
                            <p className="text-caption text-text-secondary/60">
                                {REVIEW_EMPTY_DESCRIPTION}
                            </p>
                        </div>
                    </div>
                )}
            </section>

            {selectedTil && isQuizModalOpen ? (
                <RecallQuizModal
                    onClose={() => setIsQuizModalOpen(false)}
                    tilTitle={selectedTil.title}
                />
            ) : null}
        </>
    );
}

function RecallQuizModal({
    onClose,
    tilTitle,
}: {
    onClose: () => void;
    tilTitle: string | null;
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<'O' | 'X' | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const quiz = MOCK_REVIEW_QUIZZES[currentIndex];
    const isCorrect = selectedAnswer === quiz.answer;
    const isLastQuiz = currentIndex === MOCK_REVIEW_QUIZZES.length - 1;

    const goNext = () => {
        if (!isSubmitted || !selectedAnswer) return;
        if (isLastQuiz) {
            onClose();
            return;
        }
        setCurrentIndex((index) => index + 1);
        setSelectedAnswer(null);
        setIsSubmitted(false);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-scrim px-4 backdrop-blur-sm"
            onPointerDown={onClose}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="recall-quiz-title"
                className="w-full max-w-[520px] rounded-2xl border border-text-secondary/12 glass-popover bg-surface-lowest/90 p-5 shadow-glass-popover backdrop-blur-2xl"
                onPointerDown={(event) => event.stopPropagation()}
            >
                <header className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary/60">
                            {currentIndex + 1} / {MOCK_REVIEW_QUIZZES.length}
                        </p>
                        <h2 id="recall-quiz-title" className="mt-1 text-lg font-extrabold text-text-primary">
                            {QUIZ_MODAL_TITLE}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-text-secondary/70">
                            {tilTitle || QUIZ_MODAL_DESCRIPTION}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary transition hover:bg-text-primary/8 hover:text-text-primary"
                        aria-label={QUIZ_CLOSE_LABEL}
                    >
                        <X size={17} />
                    </button>
                </header>

                <div className="mt-6 rounded-lg border border-text-secondary/8 bg-text-primary/[0.025] p-4">
                    <p className="text-base font-bold leading-relaxed text-text-primary">
                        {quiz.question}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        {(['O', 'X'] as const).map((answer) => {
                            const selected = selectedAnswer === answer;
                            const correctAnswer = quiz.answer === answer;
                            const showCorrect = isSubmitted && correctAnswer;
                            const showWrong = isSubmitted && selected && !correctAnswer;

                            return (
                                <button
                                    key={answer}
                                    type="button"
                                    onClick={() => {
                                        if (isSubmitted) return;
                                        setSelectedAnswer(answer);
                                    }}
                                    className={`flex h-14 items-center justify-center rounded-lg border text-xl font-black transition ${
                                        showCorrect
                                            ? 'til-light-teal-accent border-action-accent/50 bg-action-accent/12 text-action-accent'
                                            : showWrong
                                                ? 'border-red-400/45 bg-red-400/10 text-red-300'
                                                : selected
                                                    ? 'border-text-primary/25 bg-text-primary/8 text-text-primary'
                                                    : 'border-text-secondary/10 bg-surface-highest/30 text-text-secondary hover:border-primary-signal/35 hover:text-text-primary'
                                    }`}
                                >
                                    {answer}
                                </button>
                            );
                        })}
                    </div>

                    {isSubmitted ? (
                        <div className="mt-4 rounded-lg bg-text-primary/[0.035] p-3">
                            <p className={`flex items-center gap-1.5 text-sm font-bold ${isCorrect ? 'til-light-teal-accent text-action-accent' : 'text-red-300'}`}>
                                {isCorrect ? <CheckCircle2 size={15} /> : null}
                                {isCorrect ? QUIZ_CORRECT_LABEL : QUIZ_INCORRECT_LABEL}
                            </p>
                            <p className="mt-2 text-xs leading-relaxed text-text-secondary/75">
                                {quiz.explanation}
                            </p>
                        </div>
                    ) : null}
                </div>

                <footer className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 rounded-lg px-4 text-sm font-semibold text-text-secondary transition hover:bg-text-primary/8 hover:text-text-primary"
                    >
                        {QUIZ_CLOSE_LABEL}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (!selectedAnswer) return;
                            if (!isSubmitted) {
                                setIsSubmitted(true);
                                return;
                            }
                            goNext();
                        }}
                        disabled={!selectedAnswer}
                        className="h-9 rounded-lg bg-action-accent px-4 text-sm font-bold text-text-on-accent transition hover:bg-action-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {!isSubmitted ? QUIZ_SUBMIT_LABEL : isLastQuiz ? QUIZ_DONE_LABEL : QUIZ_NEXT_LABEL}
                    </button>
                </footer>
            </section>
        </div>
    );
}

function PanelTabButton({
    active,
    badge,
    label,
    onClick,
}: {
    active: boolean;
    badge?: number;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative flex h-9 flex-1 items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors after:absolute after:bottom-0 after:left-1/2 after:h-px after:w-8 after:-translate-x-1/2 after:transition-all ${
                active
                    ? 'til-light-teal-accent text-action-accent after:bg-action-accent'
                    : 'text-text-secondary/65 after:bg-transparent hover:text-text-primary/90 hover:after:bg-text-primary/20'
            }`}
        >
            {label}
            {badge ? (
                <span className="til-light-teal-badge rounded-full bg-action-accent/15 px-1.5 py-0.5 text-[10px] text-action-accent">
                    {badge}
                </span>
            ) : null}
        </button>
    );
}

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

function toCollectedDataType(sourceType: string): CollectedDataItem['type'] {
    if (sourceType === 'LINK') return 'link';
    if (sourceType === 'IMAGE') return 'image';
    return 'text';
}
