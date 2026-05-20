import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, X, Loader2, Info } from 'lucide-react';
import type { RecallQuizResponse, RecallQuizType } from '@san/shared';
import { useRecallQuizSubmitMutation } from '../hooks/useTilMutations';
import { tilKeys } from '../hooks/useTilQueries';

const QUIZ_MODAL_TITLE = 'Recall 퀴즈';
const QUIZ_MODAL_DESCRIPTION = '선택한 TIL을 기반으로 복습 문제를 풀어보세요.';
const QUIZ_CLOSE_LABEL = '닫기';
const QUIZ_GENERATING_LABEL = 'AI가 퀴즈를 생성하고 있어요...';
const REVIEW_NO_QUIZ_LABEL = '복습할 퀴즈가 없습니다.';
const QUIZ_CORRECT_LABEL = '정답이에요';
const QUIZ_INCORRECT_LABEL = '다시 확인해보세요';
const QUIZ_SELF_JUDGE_LABEL = '해설 확인하기';

interface RecallQuizModalProps {
    onClose: () => void;
    quizzes: RecallQuizResponse[];
    targetDate: string;
    tilTitle: string | null;
    quizType: RecallQuizType;
    onQuizTypeChange: (type: RecallQuizType) => void;
    isGenerating: boolean;
}

export function RecallQuizModal({
    onClose,
    quizzes,
    targetDate,
    tilTitle,
    quizType,
    onQuizTypeChange,
    isGenerating,
}: RecallQuizModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-scrim px-4 backdrop-blur-sm"
            onPointerDown={onClose}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="recall-quiz-title"
                className="flex h-[90vh] w-full max-w-[640px] flex-col rounded-2xl border border-text-secondary/12 glass-popover bg-surface-lowest/90 p-0 shadow-glass-popover backdrop-blur-2xl"
                onPointerDown={(event) => event.stopPropagation()}
            >
                <header className="shrink-0 border-b border-text-secondary/8 p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-3">
                                <h2 id="recall-quiz-title" className="text-lg font-extrabold text-text-primary">
                                    {QUIZ_MODAL_TITLE}
                                </h2>
                                <div className="flex rounded-lg bg-text-primary/5 p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => onQuizTypeChange('OX')}
                                        className={`rounded-md px-2 py-1 text-[10px] font-bold transition ${
                                            quizType === 'OX'
                                                ? 'bg-surface-lowest text-action-accent shadow-sm'
                                                : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                    >
                                        OX
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onQuizTypeChange('SHORT_ANSWER')}
                                        className={`rounded-md px-2 py-1 text-[10px] font-bold transition ${
                                            quizType === 'SHORT_ANSWER'
                                                ? 'bg-surface-lowest text-action-accent shadow-sm'
                                                : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                    >
                                        단답형
                                    </button>
                                </div>
                            </div>
                            <p className="mt-2 line-clamp-1 text-xs leading-relaxed text-text-secondary/70">
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
                    </div>
                </header>

                <div className="no-scrollbar flex-1 overflow-y-auto p-5">
                    {isGenerating ? (
                        <div className="flex h-full flex-col items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-primary-signal/50" />
                            <p className="mt-4 text-sm font-medium text-text-secondary">
                                {QUIZ_GENERATING_LABEL}
                            </p>
                        </div>
                    ) : quizzes.length > 0 ? (
                        <div className="space-y-6">
                            {quizzes.map((quiz, index) => (
                                <QuizCard
                                    key={quiz.quizId}
                                    quiz={quiz}
                                    index={index}
                                    targetDate={targetDate}
                                    quizType={quizType}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center py-20">
                            <p className="text-sm italic text-text-secondary/50">
                                {REVIEW_NO_QUIZ_LABEL}
                            </p>
                        </div>
                    )}
                </div>

                <footer className="shrink-0 border-t border-text-secondary/8 p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs text-text-secondary/60">
                            <Info size={14} />
                            <span>{quizType === 'OX' ? '정답을 선택하면 즉시 채점됩니다.' : '제출 후 해설을 보고 직접 확인해보세요.'}</span>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 rounded-lg bg-action-accent px-6 text-sm font-bold text-text-on-accent transition hover:bg-action-accent-hover"
                        >
                            {QUIZ_CLOSE_LABEL}
                        </button>
                    </div>
                </footer>
            </section>
        </div>
    );
}

function QuizCard({
    quiz,
    index,
    targetDate,
    quizType,
}: {
    quiz: RecallQuizResponse;
    index: number;
    targetDate: string;
    quizType: RecallQuizType;
}) {
    const queryClient = useQueryClient();
    const [answer, setAnswer] = useState(quiz.submittedAnswer ?? '');
    const isSubmitted = quiz.solved;
    const isShortAnswer = quizType === 'SHORT_ANSWER';

    const submitMutation = useRecallQuizSubmitMutation({
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: tilKeys.recallQuizzes(targetDate, quizType),
            });
        },
    });

    const handleSubmit = (submittedAnswer: string) => {
        if (isSubmitted || submitMutation.isPending) return;
        setAnswer(submittedAnswer);
        submitMutation.mutate({
            quizId: quiz.quizId,
            answer: submittedAnswer,
        });
    };

    return (
        <div className="rounded-xl border border-text-secondary/8 bg-text-primary/[0.02] p-5 transition-colors hover:border-text-secondary/15">
            <header className="mb-4 flex items-center justify-between gap-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-text-secondary/40">
                    Question {index + 1}
                </span>
                {isSubmitted && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        quiz.correct === true 
                            ? 'bg-action-accent/10 text-action-accent' 
                            : quiz.correct === false 
                                ? 'bg-red-400/10 text-red-400'
                                : 'bg-text-primary/10 text-text-secondary'
                    }`}>
                        {quiz.correct === true ? '정답' : quiz.correct === false ? '오답' : '제출완료'}
                    </span>
                )}
            </header>

            <p className="text-base font-bold leading-relaxed text-text-primary">
                {quiz.question}
            </p>

            <div className="mt-5">
                {isShortAnswer ? (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            disabled={isSubmitted}
                            placeholder="정답을 입력하세요"
                            className="h-11 flex-1 rounded-lg border border-text-secondary/10 bg-surface-highest/30 px-4 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-secondary/50 focus:border-primary-signal/40 disabled:cursor-not-allowed disabled:opacity-70"
                        />
                        {!isSubmitted && (
                            <button
                                type="button"
                                onClick={() => handleSubmit(answer)}
                                disabled={!answer.trim() || submitMutation.isPending}
                                className="h-11 shrink-0 rounded-lg bg-text-primary/5 px-4 text-sm font-bold text-text-primary transition hover:bg-text-primary/10 disabled:opacity-50"
                            >
                                {submitMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : QUIZ_SELF_JUDGE_LABEL}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {(['O', 'X'] as const).map((option) => {
                            const selected = answer === option;
                            const isCorrect = isSubmitted && quiz.answer === option && quiz.correct === true;
                            const isWrong = isSubmitted && selected && quiz.correct !== true;

                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleSubmit(option)}
                                    disabled={isSubmitted}
                                    className={`flex h-12 items-center justify-center rounded-lg border text-lg font-black transition ${
                                        isCorrect
                                            ? 'til-light-teal-accent border-action-accent/50 bg-action-accent/12 text-action-accent'
                                            : isWrong
                                                ? 'border-red-400/45 bg-red-400/10 text-red-400'
                                                : selected
                                                    ? 'border-text-primary/25 bg-text-primary/8 text-text-primary'
                                                    : 'border-text-secondary/10 bg-surface-highest/30 text-text-secondary hover:border-primary-signal/35 hover:text-text-primary'
                                    }`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {isSubmitted && quiz.explanation && (
                <div className="mt-5 rounded-lg bg-text-primary/[0.04] p-4 text-sm leading-relaxed text-text-secondary/80">
                    <div className="mb-2 flex items-center gap-1.5 font-bold text-text-primary">
                        <Info size={14} className="text-primary-signal" />
                        <span>해설</span>
                    </div>
                    {quiz.explanation}
                </div>
            )}
        </div>
    );
}
