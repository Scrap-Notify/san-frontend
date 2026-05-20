import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Search, X } from 'lucide-react';
import type {
    RecallQuizResponse,
    RecallQuizType,
    TilResponse,
    TilSourceContentResponse,
} from '@san/shared';
import type { TilRecallCardsQuery, TilSourcesQuery } from '../types';
import { CollectedDataCard, type CollectedDataItem } from './CollectedDataCard';
import { useRecallQuizSubmitMutation } from '../hooks/useTilMutations';
import { tilKeys, useTilRecallQuizzes } from '../hooks/useTilQueries';
import { RecallHistory } from './RecallHistory';

const EMPTY_SOURCES: TilSourceContentResponse[] = [];
const REVIEW_STATUS_TITLE = '복습 현황';
const REVIEW_COMPLETE_DESCRIPTION = 'Recall 퀴즈 제출 기록이 있어요.';
const REVIEW_PENDING_DESCRIPTION = 'Recall 퀴즈를 풀면 복습 완료로 표시됩니다.';
const REVIEW_SOLVED_LABEL = '풀이 현황';
const REVIEW_CORRECT_LABEL = '정답 수';
const REVIEW_STATUS_LABEL = '상태';
const REVIEW_SUBMITTED_LABEL = '제출 완료';
const REVIEW_NO_QUIZ_LABEL = '복습할 퀴즈가 없습니다.';
const QUIZ_MODAL_TITLE = 'Recall 퀴즈';
const QUIZ_MODAL_DESCRIPTION = '선택한 TIL을 기반으로 복습 문제를 풀어보세요.';
const QUIZ_CLOSE_LABEL = '닫기';
const QUIZ_SUBMIT_LABEL = '정답 확인';
const QUIZ_NEXT_LABEL = '다음 문제';
const QUIZ_DONE_LABEL = '완료';
const QUIZ_CORRECT_LABEL = '정답이에요';
const QUIZ_INCORRECT_LABEL = '다시 확인해보세요';

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
    const recallQuizzesQuery = useTilRecallQuizzes(selectedTil?.targetDate, 'OX', Boolean(selectedTil));

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
                recallQuizzes={recallQuizzesQuery.data?.quizzes ?? []}
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
    recallQuizzes,
    selectedTil,
}: {
    recallQuizzes: RecallQuizResponse[];
    selectedTil: TilResponse | null;
}) {
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const quizzes = selectedTil ? recallQuizzes : [];
    const solvedQuizCount = quizzes.filter((quiz) => quiz.solved).length;
    const correctQuizCount = quizzes.filter((quiz) => quiz.correct === true).length;
    const reviewed = solvedQuizCount > 0;
    const solvedLabel = quizzes.length > 0 ? `${solvedQuizCount}/${quizzes.length}` : '0/0';

    return (
        <>
            <section className="shrink-0 px-5 pb-6 pt-2">
                <header className="flex items-start">
                    <div className="min-w-0">
                        <p className="text-sm font-extrabold text-text-primary">
                            {REVIEW_STATUS_TITLE}
                        </p>
                        {quizzes.length > 0 && (
                            <p className="mt-1 text-xs leading-relaxed text-text-secondary/75">
                                {reviewed ? REVIEW_COMPLETE_DESCRIPTION : REVIEW_PENDING_DESCRIPTION}
                            </p>
                        )}
                    </div>
                </header>

                {quizzes.length > 0 ? (
                    <button
                        type="button"
                        onClick={() => setIsQuizModalOpen(true)}
                        className="mt-4 block w-full text-left transition focus:outline-none"
                    >
                        <div className="rounded-xl bg-text-primary/[0.03] p-4 transition hover:bg-text-primary/[0.05]">
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
                    </button>
                ) : (
                    <div className="mt-4 py-6 text-center text-sm italic text-text-secondary/50">
                        {REVIEW_NO_QUIZ_LABEL}
                    </div>
                )}
            </section>

            {selectedTil && isQuizModalOpen && quizzes.length > 0 ? (
                <RecallQuizModal
                    onClose={() => setIsQuizModalOpen(false)}
                    tilTitle={selectedTil.title}
                    targetDate={selectedTil.targetDate}
                    quizzes={quizzes}
                />
            ) : null}
        </>
    );
}

function RecallQuizModal({
    onClose,
    quizzes,
    targetDate,
    tilTitle,
}: {
    onClose: () => void;
    quizzes: RecallQuizResponse[];
    targetDate: string;
    tilTitle: string | null;
}) {
    const queryClient = useQueryClient();
    const [localQuizzes, setLocalQuizzes] = useState<RecallQuizResponse[]>(() => quizzes);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(() => quizzes[0]?.submittedAnswer ?? '');
    const [isSubmitted, setIsSubmitted] = useState(() => quizzes[0]?.solved ?? false);
    const currentQuiz = localQuizzes[currentIndex];
    const quizType: RecallQuizType = localQuizzes[0]?.quizType ?? 'OX';

    const submitMutation = useRecallQuizSubmitMutation({
        onSuccess: (response) => {
            setIsSubmitted(true);
            setLocalQuizzes((currentQuizzes) =>
                currentQuizzes.map((quiz) =>
                    quiz.quizId === response.quizId ? { ...quiz, ...response } : quiz,
                ),
            );

            void queryClient.invalidateQueries({
                queryKey: tilKeys.recallQuizzes(targetDate, quizType),
            });
        },
    });

    if (!currentQuiz) {
        return null;
    }

    const isCorrect = currentQuiz.correct === true;
    const isLastQuiz = currentIndex === localQuizzes.length - 1;
    const isShortAnswer = currentQuiz.quizType === 'SHORT_ANSWER';
    const isSubmitDisabled = submitMutation.isPending || (!isSubmitted && !selectedAnswer.trim());

    const goNext = () => {
        if (!isSubmitted) return;

        if (isLastQuiz) {
            onClose();
            return;
        }

        const nextQuiz = localQuizzes[currentIndex + 1];
        setCurrentIndex((index) => index + 1);
        setSelectedAnswer(nextQuiz?.submittedAnswer ?? '');
        setIsSubmitted(nextQuiz?.solved ?? false);
    };

    const handleSubmit = () => {
        if (submitMutation.isPending) return;

        if (!isSubmitted) {
            submitMutation.mutate({
                quizId: currentQuiz.quizId,
                answer: selectedAnswer.trim(),
            });
            return;
        }

        goNext();
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
                            {currentIndex + 1} / {localQuizzes.length}
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
                        {currentQuiz.question}
                    </p>

                    {isShortAnswer ? (
                        <label className="mt-5 block">
                            <span className="sr-only">정답 입력</span>
                            <input
                                type="text"
                                value={selectedAnswer}
                                onChange={(event) => {
                                    if (isSubmitted) return;
                                    setSelectedAnswer(event.target.value);
                                }}
                                disabled={isSubmitted}
                                placeholder="정답을 입력하세요"
                                className="h-14 w-full rounded-lg border border-text-secondary/10 bg-surface-highest/30 px-4 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-secondary/50 focus:border-primary-signal/40 disabled:cursor-not-allowed disabled:opacity-70"
                            />
                        </label>
                    ) : (
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            {(['O', 'X'] as const).map((answer) => {
                                const selected = selectedAnswer === answer;
                                const showCorrect = isSubmitted && currentQuiz.submittedAnswer === answer && currentQuiz.correct === true;
                                const showWrong = isSubmitted && selected && currentQuiz.correct !== true;

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
                    )}

                    {isSubmitted ? (
                        <div className="mt-4 rounded-lg bg-text-primary/[0.035] p-3">
                            <p className={`flex items-center gap-1.5 text-sm font-bold ${isCorrect ? 'til-light-teal-accent text-action-accent' : 'text-red-300'}`}>
                                {isCorrect ? <CheckCircle2 size={15} /> : null}
                                {isCorrect ? QUIZ_CORRECT_LABEL : QUIZ_INCORRECT_LABEL}
                            </p>
                            <p className="mt-2 text-xs leading-relaxed text-text-secondary/75">
                                {currentQuiz.explanation || ''}
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
                        onClick={handleSubmit}
                        disabled={isSubmitDisabled}
                        className="h-9 rounded-lg bg-action-accent px-4 text-sm font-bold text-text-on-accent transition hover:bg-action-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitMutation.isPending
                            ? QUIZ_SUBMIT_LABEL
                            : !isSubmitted
                                ? QUIZ_SUBMIT_LABEL
                                : isLastQuiz
                                    ? QUIZ_DONE_LABEL
                                    : QUIZ_NEXT_LABEL}
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
