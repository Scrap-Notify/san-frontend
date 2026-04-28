// packages/ui/src/components/LeafCard/LeafCard.tsx
// 지식 카드 — extension 사이드패널 + dashboard 모두 사용
// ai_status에 따라 skeleton / 실제 내용 분기 처리
import type { ReactNode } from 'react';

import type { KnowledgeCardView } from '@san/shared';
import { IconBox } from '../IconBox';
import { TagBadge } from '../TagBadge';
import { MetaLabel } from '../MetaLabel';
import { NeonDot } from '../NeonDot';
import { formatRelativeTime } from '@san/shared/utils/format';

// source_type별 아이콘 SVG (인라인 — 외부 의존 없이 독립 동작)
function SourceIcon({ type }: { type: KnowledgeCardView['source_type'] }) {
  if (type === 'LINK') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7C4.24 7 2 9.24 2 12s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1M8 13h8v-2H8v2m9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
          fill="#9ECFD6"
        />
      </svg>
    );
  }
  if (type === 'IMAGE') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
          fill="#9ECFD6"
        />
      </svg>
    );
  }
  // TEXT (default)
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
      <path
        d="M4 16H12V14H4V16ZM4 12H12V10H4V12ZM2 20C1.45 20 .979 19.804.588 19.413.196 19.021 0 18.55 0 18V2C0 1.45.196.979.588.588.979.196 1.45 0 2 0h8l6 6v12c0 .55-.196 1.021-.588 1.413C15.021 19.804 14.55 20 14 20H2zM9 7V2H2v16h12V7H9z"
        fill="#9ECFD6"
      />
    </svg>
  );
}

// ai_status가 PENDING/PROCESSING일 때 보여주는 스켈레톤
function LeafCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-leaf bg-[#181c1f] animate-pulse">
      <div className="w-10 h-10 rounded-full bg-[#313539]" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 bg-[#313539] rounded w-3/4" />
        <div className="h-2 bg-[#313539] rounded w-1/3" />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// LeafCard Props
// ──────────────────────────────────────────────
interface LeafCardProps {
  card: KnowledgeCardView;
  // compact: 익스텐션 사이드패널 (제목 + 메타만 표시)
  // full:    대시보드 (제목 + 요약 + 태그 모두 표시)
  variant?: 'compact' | 'full';
  onClick?: () => void;
}

export function LeafCard({ card, variant = 'full', onClick }: LeafCardProps) {
  // AI 처리 중이면 스켈레톤 표시
  if (card.ai_status === 'PENDING' || card.ai_status === 'PROCESSING') {
    return <LeafCardSkeleton />;
  }

  const metaSegments = [
    card.source_type,
    formatRelativeTime(card.created_at),
  ];

  return (
    <div
      onClick={onClick}
      className={`
        group flex items-center gap-4 p-4
        rounded-leaf bg-[#181c1f]
        border border-[#00ffc2]/10
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:border-[#00ffc2]/30 hover:bg-[#1c2023]' : ''}
      `}
    >
      {/* 아이콘 박스 */}
      <IconBox variant="circle" size="sm">
        <SourceIcon type={card.source_type} />
      </IconBox>

      {/* 본문 영역 */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {/* 제목 + 상태 점 */}
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-[#fbfffa] truncate">
            {card.title}
          </p>
          {card.ai_status === 'COMPLETED' && (
            <NeonDot size="sm" intensity="dim" className="flex-shrink-0" />
          )}
        </div>

        {/* full variant: 요약 텍스트 */}
        {variant === 'full' && card.summary && (
          <p className="text-sm text-[#b9cbc1] line-clamp-2 leading-relaxed">
            {card.summary}
          </p>
        )}

        {/* 메타 레이블 */}
        <MetaLabel segments={metaSegments} />

        {/* full variant: 태그 목록 */}
        {variant === 'full' && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {card.tags.map((tag) => (
              <TagBadge key={tag.tag_id} label={tag.name} />
            ))}
          </div>
        )}
      </div>

      {/* 우측 화살표 (클릭 가능한 경우만) */}
      {onClick && (
        <svg
          width="5" height="7" viewBox="0 0 5 7" fill="none"
          className="flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"
        >
          <path d="M2.683 3.5L0 .817.817 0 4.317 3.5.817 7 0 6.183 2.683 3.5z" fill="#B9CBC1" />
        </svg>
      )}
    </div>
  );
}
