import type { KnowledgeCardResponse } from './knowledge';

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

export interface TilRecallCardsResponse {
  recallCards: KnowledgeCardResponse[];
}

export type TilGithubCommitStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface TilGithubCommitJobResponse {
  commitId: string;
  jobId: string;
  summaryId: string;
  status: TilGithubCommitStatus;
}
