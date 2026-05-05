import type { AiStatus, SourceType } from './scraps';

export interface TagResponse {
  tagId: string;
  tagName: string;
}

export interface CategoryResponse {
  categoryId: string;
  categoryName: string;
}

export interface KnowledgeCardResponse {
  cardId: string;
  title: string;
  summary: string | null;
  category: CategoryResponse | null;
  tags: TagResponse[];
  createdAt: string;
}

export interface KnowledgeCardListResponse {
  cards: KnowledgeCardResponse[];
}

export interface KnowledgeCardCreateRequest {
  scrapId: string;
}

export interface GetCardsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  tag?: string;
  tags?: string[];
  search?: string;
  date?: string;
  from?: string;
  to?: string;
}

export interface Tag {
  tag_id: string;
  name: string;
}

export interface KnowledgeCardView {
  card_id: string;
  scrap_id?: string;
  category_id?: string;
  title: string;
  summary: string | null;
  tags: Tag[];
  source_url?: string | null;
  source_type: SourceType;
  ai_status: AiStatus;
  category_name: string | null;
  createdAt?: string;
  created_at: string;
  updated_at?: string | null;
  is_deleted?: boolean | null;
}

export interface GetCardsResponse {
  cards: KnowledgeCardView[];
  total?: number;
  page?: number;
  limit?: number;
}

export function toKnowledgeCardView(card: KnowledgeCardResponse): KnowledgeCardView {
  return {
    card_id: card.cardId,
    title: card.title,
    summary: card.summary,
    tags: card.tags.map((tag) => ({
      tag_id: tag.tagId,
      name: tag.tagName,
    })),
    source_type: 'TEXT',
    ai_status: 'COMPLETED',
    category_name: card.category?.categoryName ?? null,
    createdAt: card.createdAt,
    created_at: card.createdAt,
  };
}
