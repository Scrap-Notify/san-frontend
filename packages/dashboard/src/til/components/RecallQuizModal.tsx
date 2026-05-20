import { useEffect, useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { X, Loader2, Info, HelpCircle, Sparkles } from 'lucide-react';
import type { RecallQuizResponse, RecallQuizType } from '@san/shared';
import { useRecallQuizSubmitMutation } from '../hooks/useTilMutations';
import { tilKeys } from '../hooks/useTilQueries';

const QUIZ_MODAL_TITLE = '오늘의 복습 세션';
const QUIZ_CLOSE_LABEL = '닫기';
const QUIZ_GENERATING_LABEL = 'AI가 퀴즈를 생성하고 있어요...';
const REVIEW_NO_QUIZ_LABEL = '복습할 퀴즈가 없습니다.';
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
    const solvedCount = useMemo(() => quizzes.filter(q => q.solved).length, [quizzes]);
    const progress = quizzes.length > 0 ? (solvedCount / quizzes.length) * 100 : 0;

    const formattedDate = useMemo(() => {
        const date = new Date(targetDate);
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    }, [targetDate]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-md"
            onPointerDown={onClose}
        >
            <section
                role="dialog"
                aria-modal="true"
                className="flex h-[95vh] w-full max-w-[800px] flex-col overflow-hidden rounded-[32px] bg-[#0b0f12] text-[#fbfffa] shadow-2xl transition-all"
                onPointerDown={(event) => event.stopPropagation()}
            >
                {/* Header Section */}
                <header className="shrink-0 p-8 pb-4">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="min-w-0">
                            <h2 className="text-3xl font-bold tracking-tight">{QUIZ_MODAL_TITLE}</h2>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xl font-bold">{formattedDate}</span>
                            <span className="text-sm font-medium text-[#00ffc2]">오늘 복습 {quizzes.length}개</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2 relative h-1.5 w-full overflow-hidden rounded-full bg-[#1c2023]">
                        <div 
                            className="absolute top-0 left-0 h-full bg-[#00ffc2] transition-all duration-700 ease-out"
                            style={{ 
                                width: `${progress}%`,
                                boxShadow: "0px 0px 12px 0 rgba(0,255,194,0.6)"
                            }}
                        />
                    </div>
                    <div className="flex justify-between items-center px-0.5">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b9cbc1]/40">진행상황</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#b9cbc1]/40">{Math.round(progress)}% COMPLETED</span>
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                             <div className="flex rounded-xl bg-[#1c2023] p-1 border border-[#3a4a43]/20">
                                <button
                                    type="button"
                                    onClick={() => onQuizTypeChange('OX')}
                                    className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                                        quizType === 'OX'
                                            ? 'bg-[#00ffc2] text-[#007255] shadow-lg shadow-[#00ffc2]/10'
                                            : 'text-[#b9cbc1]/60 hover:text-[#fbfffa]'
                                    }`}
                                >
                                    O/X
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onQuizTypeChange('SHORT_ANSWER')}
                                    className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                                        quizType === 'SHORT_ANSWER'
                                            ? 'bg-[#00ffc2] text-[#007255] shadow-lg shadow-[#00ffc2]/10'
                                            : 'text-[#b9cbc1]/60 hover:text-[#fbfffa]'
                                    }`}
                                >
                                    단답형
                                </button>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="group flex h-10 w-10 items-center justify-center rounded-full bg-[#1c2023] text-[#b9cbc1]/60 transition-all hover:bg-[#00ffc2] hover:text-[#007255]"
                            aria-label={QUIZ_CLOSE_LABEL}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </header>

                {/* Content Section */}
                <div className="no-scrollbar flex-1 overflow-y-auto px-8 py-4">
                    {isGenerating ? (
                        <div className="flex h-full flex-col items-center justify-center py-20">
                            <div className="relative mb-6">
                                <Loader2 size={48} className="animate-spin text-[#00ffc2]/40" />
                                <Sparkles size={20} className="absolute -top-1 -right-1 text-[#00ffc2] animate-pulse" />
                            </div>
                            <p className="text-lg font-bold text-[#b9cbc1]/80">
                                {QUIZ_GENERATING_LABEL}
                            </p>
                        </div>
                    ) : quizzes.length > 0 ? (
                        <div className="space-y-12 pb-10">
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
                        <div className="flex h-full flex-col items-center justify-center py-20 text-center opacity-40">
                            <HelpCircle size={48} className="mb-4" />
                            <p className="text-lg font-medium">{REVIEW_NO_QUIZ_LABEL}</p>
                        </div>
                    )}
                </div>

                <footer className="shrink-0 bg-[#0b0f12]/80 px-8 py-6 backdrop-blur-md">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 rounded-2xl bg-[#1c2023]/50 px-4 py-2 text-xs font-medium text-[#b9cbc1]/70 border border-[#3a4a43]/10">
                            <Info size={16} className="text-[#00ffc2]" />
                            <span>{quizType === 'OX' ? '정답을 선택하면 즉시 채점됩니다.' : '제출 후 해설을 보고 직접 확인해보세요.'}</span>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-12 min-w-[120px] rounded-tl-[24px] rounded-tr-md rounded-bl-md rounded-br-[24px] bg-[#00ffc2] px-8 text-sm font-black text-[#007255] transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-[#00ffc2]/20"
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
        <div className="relative flex flex-col gap-8 rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px] bg-[#1c2023] p-8 border border-[#3a4a43]/20 shadow-xl overflow-hidden group">
            {/* Background Accent Gradient */}
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#00ffc2]/5 blur-3xl transition-all group-hover:bg-[#00ffc2]/10" />

            <div className="flex flex-col gap-4">
                <p className="text-base font-bold uppercase tracking-widest text-[#00ffc2]">
                    Question {index + 1}
                </p>
                <h3 className="text-2xl font-bold leading-tight text-[#fbfffa]">
                    {quiz.question}
                </h3>
            </div>

            <div className="flex flex-col gap-6">
                {isShortAnswer ? (
                    <div className="flex items-end gap-6 border-b border-[#3a4a43] pb-2 transition-focus-within focus-within:border-[#00ffc2]">
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            disabled={isSubmitted}
                            placeholder="정답을 입력하세요..."
                            className="w-full bg-transparent py-2 text-2xl font-medium text-[#fbfffa] outline-none placeholder:text-[#b9cbc1]/20 disabled:opacity-50"
                        />
                        {!isSubmitted && (
                            <button
                                type="button"
                                onClick={() => handleSubmit(answer)}
                                disabled={!answer.trim() || submitMutation.isPending}
                                className="mb-1 flex h-12 shrink-0 items-center justify-center rounded-tl-[24px] rounded-tr-md rounded-bl-md rounded-br-[24px] bg-[#00ffc2] px-8 text-lg font-black text-[#007255] transition-all hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:grayscale"
                            >
                                {submitMutation.isPending ? <Loader2 size={24} className="animate-spin" /> : QUIZ_SELF_JUDGE_LABEL}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-8">
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
                                    className={`relative flex h-20 items-center justify-center rounded-tl-[32px] rounded-tr-md rounded-bl-md rounded-br-[32px] border-2 text-3xl font-black transition-all ${
                                        isCorrect
                                            ? 'bg-[#00ffc2] border-[#00ffc2] text-[#007255] shadow-lg shadow-[#00ffc2]/20'
                                            : isWrong
                                                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                                : selected
                                                    ? 'bg-[#fbfffa]/10 border-[#fbfffa]/30 text-[#fbfffa]'
                                                    : 'bg-[#313539] border-transparent text-[#e0e3e7] hover:border-[#3a4a43]/50 hover:bg-[#313539]/80'
                                    } disabled:cursor-default`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {isSubmitted && quiz.explanation && (
                <div className="rounded-[32px] bg-[#181c1f] p-6 border-l-4 border-[#00ffc2] shadow-inner">
                    <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#00ffc2]">
                        <Info size={16} />
                        <span>Analysis</span>
                    </div>
                    <p className="text-lg leading-relaxed text-[#b9cbc1]">
                        {quiz.explanation}
                    </p>
                </div>
            )}
        </div>
    );
}
