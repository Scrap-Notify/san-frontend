import { CurvedButton } from '../../../../ui/src/components/Button/CurvedButton';

interface EmptyStateProps {
  onLogin: () => void;
}

export function EmptyState({ onLogin }: EmptyStateProps) {
  return (
    <div className="w-full max-w-[380px] mx-auto flex flex-col items-center text-center py-10 space-y-6">
      <div className="w-40 h-40 rounded-full bg-[#00ffc2]/5 flex items-center justify-center">
        🌱
      </div>

      <div className="text-xl font-bold text-[#e0e3e7] leading-snug">
        나만의 지식 숲을
        <br />
        시작해 보세요
      </div>

      <div className="text-sm text-[#b9cbc1] leading-6">
        로그인하면 수집한 정보가
        <br />
        울창한 지식의 숲으로 자라납니다.
      </div>

      <CurvedButton
        onClick={onLogin}
        size="lg"
        trailingIcon={<LoginArrowIcon />}
        className="gap-1.5 !px-5 !py-2.5 !text-sm !text-[var(--color-text-primary)]"
      >
        로그인하고 시작하기
      </CurvedButton>
    </div>
  );
}

function LoginArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 12V10.6667H10.6667V1.33333H6V0H10.6667C11.0333 0 11.3472 0.130556 11.6083 0.391667C11.8694 0.652778 12 0.966667 12 1.33333V10.6667C12 11.0333 11.8694 11.3472 11.6083 11.6083C11.3472 11.8694 11.0333 12 10.6667 12H6ZM4.66667 9.33333L3.75 8.36667L5.45 6.66667H0V5.33333H5.45L3.75 3.63333L4.66667 2.66667L8 6L4.66667 9.33333Z"
        fill="#007255"
      />
    </svg>
  );
}
