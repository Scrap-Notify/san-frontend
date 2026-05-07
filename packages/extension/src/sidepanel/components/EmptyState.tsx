import { Sparkles } from 'lucide-react';
import { CurvedButton } from '../../../../ui/src/components/Button/CurvedButton';

interface EmptyStateProps {
  onLogin: () => void;
}

export function EmptyState({ onLogin }: EmptyStateProps) {
  return (
    <div className="w-full max-w-[380px] mx-auto flex flex-col items-center text-center py-10 space-y-6">
      <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 w-20 h-20 rounded-leaf bg-misty-teal border border-primary-signal/40 backdrop-blur-xl">
        <Sparkles size={28} className="text-primary-signal" aria-hidden="true" />
      </div>

      <div className="text-body-lg-bold text-text-primary leading-snug">
        나만의 지식 숲을
        <br />
        시작해 보세요
      </div>

      <div className="text-body-main text-text-secondary leading-6">
        로그인하면 수집한 정보가
        <br />
        울창한 지식의 숲으로 자라납니다.
      </div>

      <CurvedButton onClick={onLogin} fullWidth size="lg" className="max-w-[280px] gap-1.5">
        로그인하고 시작하기
      </CurvedButton>
    </div>
  );
}
