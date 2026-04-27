// 프로젝트 전체에서 쓸 핵심 타입

export interface ScrapCard {
  id: string;
  url: string;
  domain: string;         // 원문 출처 (예: github.com)
  title: string;
  content: string;
  summary: string;        // AI 3줄 요약
  headerTag: string;      // 나뭇가지의 중심이 될 메인 태그
  tags: string[];
  createdAt: Date;
  recallAt: Date | null;  // 망각 곡선 기반 다음 리콜 시각
  vector?: number[];
}

export interface RecallNotification {
  cardId: string;
  triggeredBy: 'schedule' | 'context';  // 시간 기반 vs 브라우저 컨텍스트 기반
  score: number;  // 관련도 점수
}

export type ViewMode = 'card' | 'graph';