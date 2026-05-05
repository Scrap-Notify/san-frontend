import type { BaseEntity } from './common';

export type SourceType = 'LINK' | 'TEXT' | 'IMAGE';

export interface Scrap extends BaseEntity {
  scrapId: string;
  sourceType: SourceType;
  sourceUrl: string | null;
  rawContent: string | null;
  imageUrl: string | null;
  ai_status?: AiStatus;
}

export interface CreateScrapRequest {
  sourceUrl?: string | null;
  rawContent?: string | null;
  imageUrl?: string | null;
  collectedAt?: string;
}

export type CreateScrapResponse = Scrap;

export type AiStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface PendingScrapView {
  source_type: SourceType;
  source_url?: string | null;
  raw_content?: string | null;
  image_url?: string | null;
}
