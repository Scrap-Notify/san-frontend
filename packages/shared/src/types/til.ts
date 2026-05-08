import type { KnowledgeCardResponse } from './knowledge';
import type { CategoryResponse } from './knowledge';
import type { SourceType } from './scraps';

export interface TilGenerateRequest {
  targetDate: string;
}

export interface TilGenerationJobResponse {
  summaryId: string;
  jobId: string;
  targetDate: string;
}

export interface TilResponse {
  summaryId: string;
  targetDate: string;
  title: string | null;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TilSourceContentResponse {
  cardId: string;
  scrapId: string;
  title: string;
  sourceType: 'LINK' | 'TEXT' | 'IMAGE';
  rawContent: string;
  sourceUrl: string | null;
  imageUrl: string | null;
  category: {
    categoryId: string;
    categoryName: string;
  } | null;
  createdAt: string;
}

export interface TilRecallCardsResponse {
  sources: TilSourceContentResponse[];
}

export interface TilSourceContentResponse {
  cardId: string;
  scrapId: string;
  title: string;
  sourceType: SourceType;
  rawContent: string | null;
  sourceUrl: string | null;
  imageUrl: string | null;
  category: CategoryResponse | null;
  createdAt: string;
}

export interface TilSourcesResponse {
  sources: TilSourceContentResponse[];
}

export type TilGithubCommitStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface TilGithubCommitJobResponse {
  commitId: string;
  jobId: string;
  summaryId: string;
  status: TilGithubCommitStatus;
}
