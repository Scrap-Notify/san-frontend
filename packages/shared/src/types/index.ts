// packages/shared/src/types/index.ts
// =============================================
// ERD 기반 전체 타입 정의
// 테이블 순서: users → scraps → knowledge_cards
//              → tags → card_tags → categories
//              → notifications → knowledge_card_embeddings
// =============================================

// ----------------------------
// 공통 베이스 타입
// ----------------------------
export interface BaseEntity {
  created_at: string;
  updated_at: string | null;
  is_deleted: boolean | null;
}

// ----------------------------
// 사용자 (users)
// ----------------------------
export interface User extends BaseEntity {
  user_id: string;
  email: string;
  nickname: string;
  profile_image_url: string | null;
}

// ----------------------------
// 수집 원본 (scraps)
// ai_status: AI 처리 파이프라인 상태
// PENDING    → 방금 저장됨, AI 처리 대기 중
// PROCESSING → AI 요약/태깅 진행 중
// COMPLETED  → 처리 완료, knowledge_card 생성됨
// FAILED     → AI 처리 실패
// ----------------------------
export type SourceType = 'LINK' | 'TEXT' | 'IMAGE';
export type AiStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Scrap extends BaseEntity {
  scrap_id: string;
  user_id: string;
  source_type: SourceType;
  source_url: string | null;   // LINK 타입일 때 원본 URL
  raw_content: string | null;  // 수집된 텍스트 본문
  image_url: string | null;    // IMAGE 타입일 때 S3 URL
  ai_status: AiStatus;
}

// ----------------------------
// 지식 카드 (knowledge_cards)
// scraps → AI 처리 → knowledge_cards 생성
// ----------------------------
export interface KnowledgeCard extends BaseEntity {
  card_id: string;
  scrap_id: string;
  category_id: string;
  title: string;
  summary: string | null; // AI 3줄 요약
}

// ----------------------------
// 태그 (tags)
// ----------------------------
export interface Tag {
  tag_id: string;
  name: string; // UNIQUE
}

// ----------------------------
// 카드-태그 매핑 (card_tags) — M:N
// ----------------------------
export interface CardTag {
  card_id: string;
  tag_id: string;
}

// ----------------------------
// 카테고리 (categories)
// ----------------------------
export interface Category extends BaseEntity {
  category_id: string;
  name: string;
}

// ----------------------------
// 알림 (notifications)
// ----------------------------
export interface Notification extends BaseEntity {
  notification_id: string;
  user_id: string;
  type: string;
  reference_id: string | null; // 클릭 시 이동할 카드/스크랩 id
  title: string;
  body: string | null;
  is_read: boolean | null;     // default: false
  read_at: string | null;
}

// ----------------------------
// 지식 카드 임베딩 (knowledge_card_embeddings)
// 벡터 검색용 — Phase 2에서 본격 활용
// ----------------------------
export interface KnowledgeCardEmbedding {
  card_id: string;             // FK → knowledge_cards (1:1)
  embedding: number[];         // vector(1536)
  created_at: string;
}

// =============================================
// 프론트엔드 뷰 타입 (API 응답 조합형)
// 실제 API가 조인해서 내려주는 형태
// =============================================

// 대시보드/사이드패널 카드 렌더링용
export interface KnowledgeCardView extends KnowledgeCard {
  tags: Tag[];
  source_url: string | null;   // scraps.source_url 조인
  source_type: SourceType;
  ai_status: AiStatus;
  category_name: string | null;
}

// =============================================
// API 요청/응답 타입
// =============================================

// POST /scraps — 스크랩 생성 요청 (Content Script → Backend)
export interface CreateScrapRequest {
  source_type: SourceType;
  source_url?: string;
  raw_content?: string;
  image_url?: string;
}

// POST /scraps 응답
export interface CreateScrapResponse {
  scrap_id: string;
  ai_status: AiStatus;
  message: string;
}

// GET /cards 응답
export interface GetCardsResponse {
  cards: KnowledgeCardView[];
  total: number;
  page: number;
  limit: number;
}

// GET /cards 쿼리 파라미터
export interface GetCardsParams {
  page?: number;
  limit?: number;
  category_id?: string;
  tag?: string;
  tags?: string[];
  search?: string;
  date?: string;
  from?: string;
  to?: string;
}
