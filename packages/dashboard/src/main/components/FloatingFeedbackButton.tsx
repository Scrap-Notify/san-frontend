import { useState } from 'react';
import { MessageCircleQuestion } from 'lucide-react';
import { FeedbackDialog } from './FeedbackDialog';

export function FloatingFeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Send feedback"
        className="san-feedback-float fixed bottom-6 right-6 z-40 inline-flex h-14 items-center gap-2 rounded-full border border-[#4ade80]/50 bg-[#4ade80] px-5 text-sm font-black text-black shadow-[0_18px_52px_rgba(0,0,0,0.42),0_0_34px_rgba(74,222,128,0.34)] transition hover:-translate-y-0.5 hover:bg-[#7df3a0] hover:shadow-[0_22px_60px_rgba(0,0,0,0.48),0_0_46px_rgba(74,222,128,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80]/60"
      >
        <MessageCircleQuestion size={21} strokeWidth={2} />
        <span>Feedback</span>
      </button>
      <FeedbackDialog open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
