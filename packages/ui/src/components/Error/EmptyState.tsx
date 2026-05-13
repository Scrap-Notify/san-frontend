// packages/ui/src/components/EmptyState/EmptyState.tsx
// 공통 빈 화면 컴포넌트
// 데이터가 없는 정상 상태에서 사용 — 에러 상태와 구분
//
// 사용 예시:
// <EmptyState type="recall" />
// <EmptyState type="search" title={`"${keyword}"에 대한 결과가 없어요`} />
// <EmptyState type="archive" variant="inline" primaryAction={{ label: "시작하기", onClick }} />

// =============================================
// 타입 정의
// =============================================

export type EmptyStateType =
  | 'recall'    // 오늘 복습 없음
  | 'archive'   // 지식카드 목록 없음
  | 'search'    // 검색 결과 없음
  | 'til'       // TIL 없음
  | 'scrap'     // 수집 데이터 없음
  | 'custom';   // 직접 지정

interface ActionButton {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  primaryAction?: ActionButton;
  secondaryAction?: ActionButton;
  variant?: 'full' | 'inline';
}

// =============================================
// 타입별 프리셋
// =============================================
const EMPTY_PRESET: Record<EmptyStateType, { title: string; description: string }> = {
  recall: {
    title:       '오늘은 복습할 항목이 없어요',
    description: '뿌리가 튼튼하게 자리를 잡았습니다.\n새로운 지식을 수확하면 내일 다시 안내해 드릴게요.',
  },
  archive: {
    title:       '아직 저장된 지식이 없어요',
    description: '익스텐션으로 첫 번째 스크랩을 시작해보세요.\n지식이 쌓이면 여기서 확인할 수 있어요.',
  },
  search: {
    title:       '검색 결과가 없어요',
    description: '다른 키워드로 검색하거나\n태그를 변경해보세요.',
  },
  til: {
    title:       '아직 작성한 TIL이 없어요',
    description: '오늘 배운 것을 기록해보세요.\n지식이 뿌리내리기 시작할 거예요.',
  },
  scrap: {
    title:       '수집한 데이터가 없어요',
    description: '익스텐션으로 웹페이지를 스크랩하면\n여기에 나타나요.',
  },
  custom: {
    title:       '데이터가 없어요',
    description: '아직 표시할 내용이 없어요.',
  },
};

// =============================================
// 타입별 아이콘
// =============================================
function EmptyIcon({ type, size = 40 }: { type: EmptyStateType; size?: number }) {
  const color = '#00ffc2';
  const muted = '#1e5056';

  if (type === 'recall') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <path
          d="M20 4C12 4 6 12 6 20c0 5 2.5 9 6 12v4h16v-4c3.5-3 6-7 6-12 0-8-6-16-14-16z"
          fill={muted} opacity="0.4"
        />
        <path
          d="M20 8C14 8 10 14 10 20c0 4 1.5 7 4 9.5"
          stroke={color} strokeWidth="1.5" strokeLinecap="round"
        />
        <circle cx="20" cy="20" r="3" fill={color} opacity="0.6"/>
        <path d="M20 14v6l4 2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  }

  if (type === 'archive') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <rect x="6" y="10" width="28" height="22" rx="4" fill={muted} opacity="0.3"/>
        <rect x="6" y="6" width="28" height="8" rx="2" stroke={color} strokeWidth="1.5" fill="none"/>
        <path d="M15 22h10M15 27h7" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <circle cx="32" cy="32" r="6" fill={muted} opacity="0.4"/>
        <path d="M30 32h4M32 30v4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  }

  if (type === 'search') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="18" cy="18" r="11" fill={muted} opacity="0.3"/>
        <circle cx="18" cy="18" r="11" stroke={color} strokeWidth="1.5" fill="none"/>
        <path d="M26 26l7 7" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 18h8M18 14v8" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      </svg>
    );
  }

  if (type === 'til') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <rect x="8" y="6" width="24" height="30" rx="3" fill={muted} opacity="0.3"/>
        <rect x="8" y="6" width="24" height="30" rx="3" stroke={color} strokeWidth="1.5" fill="none"/>
        <path d="M14 14h12M14 20h12M14 26h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <circle cx="30" cy="30" r="7" fill="#101417" stroke={color} strokeWidth="1.5"/>
        <path d="M27.5 30l2 2 3-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  if (type === 'scrap') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <path
          d="M20 6l3.5 7 7.5 1-5.5 5.5 1.5 7.5L20 24l-7 3L14.5 19.5 9 14l7.5-1z"
          fill={muted} opacity="0.3" stroke={color} strokeWidth="1.5" strokeLinejoin="round"
        />
        <path d="M20 26v8M16 34h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      </svg>
    );
  }

  // custom
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path
        d="M20 6C12 6 6 13 8 22c2 8 10 12 16 10 4-1.5 8-6 8-12 0-8-5-14-12-14z"
        fill={muted} opacity="0.4" stroke={color} strokeWidth="1.5"
      />
      <path d="M20 34V20M14 26l6-6 6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// =============================================
// 아이콘 배경 카드 (full variant 전용)
// =============================================
function IconCard({ type }: { type: EmptyStateType }) {
  return (
    <div className="relative">
      <div
        className="w-48 h-48 rounded-[32px] flex items-center justify-center
                   bg-[#1e5056]/20 border border-[#1e5056]/30
                   shadow-[0_0_60px_rgba(0,255,194,0.05)]"
      >
        <EmptyIcon type={type} size={64} />
      </div>
      {/* 파티클 장식 */}
      <div className="absolute top-4 right-6 w-1.5 h-1.5 rounded-full bg-[#00ffc2]/40" />
      <div className="absolute bottom-8 left-4 w-1 h-1 rounded-full bg-[#00ffc2]/30" />
      <div className="absolute top-12 left-2 w-1 h-1 rounded-full bg-[#1e5056]/60" />
      <div className="absolute bottom-4 right-2 w-1.5 h-1.5 rounded-full bg-[#1e5056]/40" />
    </div>
  );
}

// =============================================
// EmptyState 컴포넌트
// =============================================
export function EmptyState({
  type = 'archive',
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = 'inline',
}: EmptyStateProps) {
  const preset = EMPTY_PRESET[type];
  const displayTitle       = title       ?? preset.title;
  const displayDescription = description ?? preset.description;

  // ── full variant: 전체 화면 ──
  if (variant === 'full') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 gap-8">
        <IconCard type={type} />

        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <h3 className="text-xl font-black text-[#fbfffa]">{displayTitle}</h3>
          <p className="text-sm text-[#83958c] leading-relaxed whitespace-pre-line">
            {displayDescription}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="px-8 py-3 rounded-full bg-[#00ffc2] text-[#101417]
                         font-bold text-sm
                         hover:bg-[#00ffc2]/90 transition-all duration-200
                         shadow-[0_0_20px_rgba(0,255,194,0.3)]"
            >
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="text-[#83958c] text-xs tracking-widest uppercase
                         hover:text-[#b9cbc1] transition-colors duration-200
                         flex items-center gap-1"
            >
              {secondaryAction.label}
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
                 py-10 px-6 text-center
                 rounded-leaf border border-[#1e5056]/20
                 bg-[#181c1f]/40"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center
                   bg-[#1e5056]/20 border border-[#1e5056]/30"
      >
        <EmptyIcon type={type} size={28} />
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-[#fbfffa]">{displayTitle}</p>
        <p className="text-xs text-[#83958c] leading-relaxed whitespace-pre-line">
          {displayDescription}
        </p>
      </div>

      {primaryAction && (
        <button
          onClick={primaryAction.onClick}
          className="px-5 py-2 rounded-full
                     bg-[#00ffc2]/10 border border-[#00ffc2]/30
                     text-[#00ffc2] text-xs font-semibold
                     hover:bg-[#00ffc2]/20 transition-all duration-200"
        >
          {primaryAction.label}
        </button>
      )}
    </div>
  );
}
