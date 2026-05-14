import { type FormEvent, useState } from 'react';
import { Bug, CheckCircle2, Lightbulb, Loader2, MessageSquare, SmilePlus, X } from 'lucide-react';
import { getApiErrorMessage, type FeedbackType } from '@san/shared';
import { feedbackApi } from '@extension/api/client';

interface FeedbackPopoverProps {
  onClose: () => void;
}

const feedbackTypes: Array<{
  type: FeedbackType;
  label: string;
  icon: typeof Bug;
}> = [
  { type: 'BUG', label: '\uBC84\uADF8', icon: Bug },
  { type: 'INCONVENIENCE', label: '\uBD88\uD3B8\uD568', icon: SmilePlus },
  { type: 'FEATURE_REQUEST', label: '\uC81C\uC548', icon: Lightbulb },
  { type: 'ETC', label: '\uAE30\uD0C0', icon: MessageSquare },
];

const text = {
  title: '\uC758\uACAC \uBCF4\uB0B4\uAE30',
  success: '\uD53C\uB4DC\uBC31\uC774 \uC804\uC1A1\uB418\uC5C8\uC2B5\uB2C8\uB2E4.',
  close: '\uB2EB\uAE30',
  placeholder: '\uD3B8\uD558\uAC8C \uC758\uACAC\uC744 \uB0A8\uACA8\uC8FC\uC138\uC694.',
  errorFallback: '\uD53C\uB4DC\uBC31 \uC804\uC1A1\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.',
  cancel: '\uCDE8\uC18C',
  send: '\uBCF4\uB0B4\uAE30',
};

async function getActiveTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url ?? window.location.href;
}

export function FeedbackPopover({ onClose }: FeedbackPopoverProps) {
  const [type, setType] = useState<FeedbackType>('INCONVENIENCE');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await feedbackApi.create({
        type,
        content: trimmedContent,
        pageUrl: await getActiveTabUrl(),
      });
      setIsSuccess(true);
      setContent('');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, text.errorFallback));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute right-0 top-10 z-50 w-[260px] rounded-lg border border-white/[0.16] bg-[#111614]/92 p-2.5 shadow-[0_18px_46px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-primary-signal">Feedback</p>
          <h2 className="mt-0.5 text-xs font-bold text-text-primary">{text.title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md text-text-secondary transition hover:bg-white/10 hover:text-text-primary"
          aria-label="Close feedback"
        >
          <X size={14} />
        </button>
      </div>

      {isSuccess ? (
        <div className="mt-3 rounded-lg border border-primary-signal/20 bg-primary-signal/10 p-3 text-center">
          <CheckCircle2 className="mx-auto text-primary-signal" size={22} />
          <p className="mt-2 text-xs font-semibold text-text-primary">{text.success}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 h-8 rounded-md bg-primary-signal px-3 text-xs font-bold text-black transition hover:bg-primary-signal/90"
          >
            {text.close}
          </button>
        </div>
      ) : (
        <form className="mt-2.5 flex flex-col gap-2.5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 gap-1">
            {feedbackTypes.map((item) => {
              const Icon = item.icon;
              const isSelected = item.type === type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setType(item.type)}
                  className={[
                    'flex h-10 flex-col items-center justify-center gap-0.5 rounded-md border text-[9px] font-semibold transition',
                    isSelected
                      ? 'border-primary-signal/55 bg-primary-signal/15 text-primary-signal'
                      : 'border-white/10 bg-white/[0.04] text-text-secondary hover:border-white/20 hover:text-text-primary',
                  ].join(' ')}
                >
                  <Icon size={13} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={5000}
            rows={4}
            placeholder={text.placeholder}
            className="min-h-[88px] resize-none rounded-md border border-white/10 bg-black/20 p-2.5 text-xs text-text-primary outline-none transition placeholder:text-text-secondary/55 focus:border-primary-signal/45"
          />

          {errorMessage && (
            <p className="rounded-md border border-red-400/20 bg-red-500/10 px-2 py-1.5 text-[11px] text-red-200">
              {errorMessage}
            </p>
          )}

          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="h-7 rounded-md border border-white/10 px-2.5 text-[11px] font-semibold text-text-secondary transition hover:bg-white/5 hover:text-text-primary"
            >
              {text.cancel}
            </button>
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="flex h-7 min-w-14 items-center justify-center rounded-md bg-primary-signal px-2.5 text-[11px] font-bold text-black transition hover:bg-primary-signal/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : text.send}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
