import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Bug, CheckCircle2, Lightbulb, Loader2, MessageCircle, SmilePlus, X } from 'lucide-react';
import { getApiErrorMessage, type FeedbackType } from '@san/shared';
import { feedbackApi } from '@dashboard/api/client';

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
}

const FEEDBACK_TYPES = [
  {
    value: 'BUG',
    label: '버그 제보',
    description: '오류, 멈춤, 화면 깨짐',
    icon: Bug,
    activeClassName: 'border-red-300/35 bg-red-400/10 text-red-200 shadow-[0_0_22px_rgba(252,165,165,0.12)]',
    iconClassName: 'bg-red-400/10 text-red-200 shadow-[0_0_14px_rgba(252,165,165,0.12)]',
  },
  {
    value: 'INCONVENIENCE',
    label: '불편한 점',
    description: '흐름이 막히거나 번거로운 부분',
    icon: SmilePlus,
    activeClassName: 'border-amber-300/35 bg-amber-300/10 text-amber-100 shadow-[0_0_22px_rgba(252,211,77,0.12)]',
    iconClassName: 'bg-amber-300/10 text-amber-100 shadow-[0_0_14px_rgba(252,211,77,0.12)]',
  },
  {
    value: 'FEATURE_REQUEST',
    label: '기능 제안',
    description: '있으면 더 좋아질 아이디어',
    icon: Lightbulb,
    activeClassName: 'border-[#4ade80]/45 bg-[#4ade80]/10 text-[#4ade80] shadow-[0_0_22px_rgba(74,222,128,0.12)]',
    iconClassName: 'bg-[#4ade80]/10 text-[#4ade80] shadow-[0_0_14px_rgba(74,222,128,0.12)]',
  },
  {
    value: 'ETC',
    label: '기타 의견',
    description: '응원, 질문, 자유로운 의견',
    icon: MessageCircle,
    activeClassName: 'border-sky-300/35 bg-sky-300/10 text-sky-100 shadow-[0_0_22px_rgba(125,211,252,0.12)]',
    iconClassName: 'bg-sky-300/10 text-sky-100 shadow-[0_0_14px_rgba(125,211,252,0.12)]',
  },
] satisfies Array<{
  value: FeedbackType;
  label: string;
  description: string;
  icon: typeof Bug;
  activeClassName: string;
  iconClassName: string;
}>;

export function FeedbackDialog({ open, onClose }: FeedbackDialogProps) {
  if (!open) return null;

  return <FeedbackDialogContent onClose={onClose} />;
}

function FeedbackDialogContent({ onClose }: Pick<FeedbackDialogProps, 'onClose'>) {
  const [type, setType] = useState<FeedbackType>('BUG');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const pageUrl = useMemo(() => (typeof window === 'undefined' ? '' : window.location.href), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedContent = content.trim();
    const trimmedContact = contact.trim();

    if (!trimmedContent) {
      setErrorMessage('피드백 내용을 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await feedbackApi.create({
        type,
        content: trimmedContent,
        contact: trimmedContact || null,
        pageUrl,
      });
      setIsSubmitted(true);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, '피드백 전송에 실패했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="max-h-[calc(100vh-48px)] w-full max-w-[460px] overflow-y-auto rounded-xl border border-white/15 bg-[#121212]/72 shadow-[0_24px_80px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/5 px-5 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#4ade80]">Feedback</p>
            <h2 className="mt-1.5 text-lg font-bold text-white">의견 보내기</h2>
            <p className="mt-1 text-sm text-white/45">현재 페이지 정보가 함께 전송됩니다.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md p-2 text-white/35 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="피드백 닫기"
          >
            <X size={18} />
          </button>
        </div>

        {isSubmitted ? (
          <div className="grid gap-5 px-6 py-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#4ade80]/10 text-[#4ade80]">
              <CheckCircle2 size={24} />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">피드백이 전송되었습니다</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/45">남겨주신 의견은 서비스 개선에 반영하겠습니다.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mx-auto h-10 rounded-md bg-[#4ade80] px-5 text-sm font-bold text-black transition hover:bg-[#4ade80]/90"
            >
              확인
            </button>
          </div>
        ) : (
          <form className="grid gap-4 px-5 py-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <span className="text-xs font-bold text-white/50">유형</span>
              <div className="grid grid-cols-2 gap-2">
                {FEEDBACK_TYPES.map((item) => {
                  const Icon = item.icon;
                  const selected = type === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setType(item.value)}
                      className={`flex min-h-[48px] items-center gap-2 rounded-md border px-2.5 text-left backdrop-blur-xl transition ${
                        selected
                          ? item.activeClassName
                          : 'border-white/10 bg-white/[0.045] text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/20 hover:bg-white/[0.07] hover:text-white hover:shadow-[0_0_18px_rgba(255,255,255,0.05)]'
                      }`}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${selected ? item.iconClassName : 'bg-white/5 text-white/35'}`}>
                        <Icon size={15} strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-bold">{item.label}</span>
                        <span className={`mt-0.5 block truncate text-[10px] ${selected ? 'text-current opacity-70' : 'text-white/32'}`}>
                          {item.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="grid gap-2">
              <span className="text-xs font-bold text-white/50">내용</span>
              <textarea
                value={content}
                onChange={(event) => {
                  setContent(event.target.value);
                  setErrorMessage(null);
                }}
                maxLength={5000}
                placeholder="편하게 의견을 남겨주세요. 사소한 불편이나 떠오른 아이디어도 좋아요."
                className="min-h-28 resize-none rounded-lg border border-white/10 bg-[#1c1c1c] px-4 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-white/25 focus:border-[#4ade80]/45"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-bold text-white/50">연락처 또는 이메일 (선택)</span>
              <input
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                maxLength={255}
                placeholder="좋은 의견은 작은 선물로 감사 인사를 전할게요."
                className="h-11 rounded-lg border border-white/10 bg-[#1c1c1c] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#4ade80]/45"
              />
            </label>

            <div className="grid gap-1">
              <p className="text-[11px] font-bold text-white/35">불편을 느낀 URL</p>
              <p className="truncate text-xs text-white/35">{pageUrl}</p>
            </div>

            {errorMessage && (
              <p className="flex items-center gap-2 text-sm font-medium text-red-300">
                <AlertCircle size={16} />
                {errorMessage}
              </p>
            )}

            <div className="flex justify-end gap-2 border-t border-white/5 pt-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-10 rounded-md border border-white/10 px-4 text-sm font-bold text-white/45 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#4ade80] px-4 text-sm font-bold text-black transition hover:bg-[#4ade80]/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                보내기
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
