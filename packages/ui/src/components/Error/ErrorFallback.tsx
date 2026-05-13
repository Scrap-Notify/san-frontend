// packages/ui/src/components/ErrorFallback/ErrorFallback.tsx
// 공통 에러 화면 컴포넌트
// API 실패, 네트워크 오류, 예상치 못한 에러 등 모든 에러 케이스에 사용
//
// 사용 예시:
// <ErrorFallback />                                        // 기본
// <ErrorFallback message="카드를 불러오지 못했어요" />
// <ErrorFallback message="..." onRetry={() => refetch()} /> // 재시도 버튼
// <ErrorFallback variant="inline" message="..." />          // 인라인 (섹션 내부)
// <ErrorFallback variant="full" message="..." />            // 전체 화면

interface ErrorFallbackProps {
  // 에러 메시지 (기본값: "오류가 발생했어요")
  message?: string;
  // 부연 설명
  description?: string;
  // 재시도 콜백 (없으면 버튼 미표시)
  onRetry?: () => void;
  // full: 전체 화면 / inline: 섹션 내부 (기본값: inline)
  variant?: 'full' | 'inline';
  // 에러 종류별 프리셋
  type?: 'default' | 'network' | 'notFound' | 'server' | 'auth';
}

// 에러 타입별 기본 메시지
const ERROR_PRESET: Record<
  NonNullable<ErrorFallbackProps['type']>,
  { message: string; description: string }
> = {
  default:  { message: '오류가 발생했어요',          description: '잠시 후 다시 시도해주세요' },
  network:  { message: '인터넷 연결을 확인해주세요', description: '네트워크 상태를 확인하고 다시 시도해주세요' },
  notFound: { message: '찾을 수 없어요',             description: '삭제되었거나 존재하지 않는 페이지예요' },
  server:   { message: '서버 오류가 발생했어요',     description: '잠시 후 다시 시도해주세요' },
  auth:     { message: '로그인이 필요해요',          description: '대시보드에서 로그인 후 이용해주세요' },
};

// 에러 타입별 아이콘 SVG
function ErrorIcon({ type }: { type: NonNullable<ErrorFallbackProps['type']> }) {
  if (type === 'network') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path
          d="M1 6s4-4 11-4 11 4 11 4M5 10s2.5-2.5 7-2.5 7 2.5 7 2.5M9 14s1.5-1.5 3-1.5 3 1.5 3 1.5M12 18h.01"
          stroke="#00ffc2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        />
        <line x1="2" y1="2" x2="22" y2="22" stroke="#ff4d4d" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  }
  if (type === 'notFound') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="#00ffc2" strokeWidth="1.5"/>
        <path d="m21 21-4.35-4.35" stroke="#00ffc2" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M11 8v3M11 14h.01" stroke="#83958c" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  }
  if (type === 'auth') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="#00ffc2" strokeWidth="1.5"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#00ffc2" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="1" fill="#83958c"/>
      </svg>
    );
  }
  // default, server
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path
        d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        stroke="#00ffc2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M12 9v4M12 17h.01" stroke="#83958c" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function ErrorFallback({
  message,
  description,
  onRetry,
  variant = 'inline',
  type = 'default',
}: ErrorFallbackProps) {
  const preset = ERROR_PRESET[type];
  const displayMessage     = message     ?? preset.message;
  const displayDescription = description ?? preset.description;

  // ── full variant: 전체 화면 ──
  if (variant === 'full') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#101417] px-8">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center">

          {/* 아이콘 배경 */}
          <div
            className="w-20 h-20 rounded-leaf flex items-center justify-center
                       bg-[#1e5056]/20 border border-[#1e5056]/30
                       shadow-[0_0_30px_rgba(0,255,194,0.05)]"
          >
            <ErrorIcon type={type} />
          </div>

          {/* 텍스트 */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-black text-[#fbfffa]">{displayMessage}</h2>
            <p className="text-sm text-[#83958c] leading-relaxed">{displayDescription}</p>
          </div>

          {/* 재시도 버튼 */}
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-6 py-2.5
                         rounded-full bg-[#00ffc2]/10 border border-[#00ffc2]/30
                         text-[#00ffc2] text-sm font-semibold
                         hover:bg-[#00ffc2]/20 transition-all duration-200"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                />
                <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path
                  d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                />
              </svg>
              다시 시도
            </button>
          )}

        </div>
      </div>
    );
  }

  // ── inline variant: 섹션 내부 ──
  return (
    <div
      className="flex flex-col items-center justify-center gap-4
                 py-12 px-6 text-center
                 rounded-leaf border border-[#1e5056]/20
                 bg-[#181c1f]/60"
    >
      {/* 아이콘 */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center
                   bg-[#1e5056]/20 border border-[#1e5056]/30"
      >
        <ErrorIcon type={type} />
      </div>

      {/* 텍스트 */}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-[#fbfffa]">{displayMessage}</p>
        <p className="text-xs text-[#83958c]">{displayDescription}</p>
      </div>

      {/* 재시도 버튼 */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-4 py-2
                     rounded-full bg-[#00ffc2]/10 border border-[#00ffc2]/20
                     text-[#00ffc2] text-xs font-medium
                     hover:bg-[#00ffc2]/20 transition-all duration-200"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            />
            <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path
              d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            />
          </svg>
          다시 시도
        </button>
      )}

    </div>
  );
}
