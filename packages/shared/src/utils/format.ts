// packages/shared/src/utils/format.ts
// =============================================
// 날짜 포맷
// =============================================

// "2026-04-28T10:00:00.000Z" → "2026. 4. 28."
export function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(isoString));
}

// "2026-04-28T10:00:00.000Z" → "3시간 전", "방금 전"
export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return formatDate(isoString);
}

// =============================================
// 텍스트 포맷
// =============================================

// URL에서 도메인만 추출: "https://docs.react.dev/..." → "docs.react.dev"
export function extractDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// 긴 텍스트 말줄임: 기본 100자
export function truncate(text: string, maxLength = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// =============================================
// ai_status 한국어 레이블
// =============================================
export function getAiStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'AI 처리 대기 중',
    PROCESSING: 'AI 분석 중',
    COMPLETED: '완료',
    FAILED: '처리 실패',
  };
  return labels[status] ?? status;
}