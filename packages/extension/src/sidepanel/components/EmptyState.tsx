import { CurvedButton } from '../../../../ui/src/components/Button/CurvedButton';

interface EmptyStateProps {
  onLogin: () => void;
}

export function EmptyState({ onLogin }: EmptyStateProps) {
  return (
    <div className="w-full max-w-[380px] mx-auto flex flex-col items-center text-center py-10 space-y-6">
      <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 w-20 h-20 rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px] bg-[#1e5056]/40 border border-[#00ffc2]/40 backdrop-blur-xl">
        <div className="flex flex-col justify-start items-center flex-grow-0 flex-shrink-0 relative">
          <svg
            width={35}
            height={35}
            viewBox="0 0 35 35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-grow-0 flex-shrink-0"
            preserveAspectRatio="none"
          >
            <path
              d="M16.5 34.0494C15.4 34.0494 14.2917 33.9244 13.175 33.6744C12.0583 33.4244 10.9167 33.0661 9.75 32.5994C10.15 28.5661 11.3167 24.7994 13.25 21.2994C15.1833 17.7994 17.6667 14.7161 20.7 12.0494C17.0333 13.9161 13.8583 16.3828 11.175 19.4494C8.49167 22.5161 6.61667 26.0161 5.55 29.9494C5.41667 29.8494 5.29167 29.7411 5.175 29.6244C5.05833 29.5078 4.93333 29.3828 4.8 29.2494C3.23333 27.6828 2.04167 25.9328 1.225 23.9994C0.408333 22.0661 0 20.0494 0 17.9494C0 15.6828 0.45 13.5161 1.35 11.4494C2.25 9.38277 3.5 7.54944 5.1 5.94944C7.8 3.24944 11.3 1.4911 15.6 0.674438C19.9 -0.142228 25.9333 -0.217228 33.7 0.449438C34.3 8.41611 34.2 14.4911 33.4 18.6744C32.6 22.8578 30.8667 26.2828 28.2 28.9494C26.5667 30.5828 24.7417 31.8411 22.725 32.7244C20.7083 33.6078 18.6333 34.0494 16.5 34.0494Z"
              fill="#00FFC2"
            />
          </svg>
        </div>
      </div>;

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
        className="gap-1.5 !px-5 !py-2.5 !text-sm"
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
