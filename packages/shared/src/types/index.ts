// types 폴더의 타입들을 index.ts에서 export하여 다른 패키지에서 쉽게 import할 수 있도록 함

export type { BaseEntity } from './common';
export type { AuthProvider, User, UserStatus } from './user';
export type { AsyncJobStatus, AsyncJobStatusResponse, AsyncJobType } from './async';
export type {
  AiStatus,
  CreateScrapRequest,
  CreateScrapResponse,
  PendingScrapView,
  Scrap,
  SourceType,
} from './scraps';
export type {
  S3PresignedUrlRequest,
  S3PresignedUrlResponse,
  S3UploadImageResult,
} from './s3';
export type {
  CategoryResponse,
  KnowledgeCardAnalysisJobResponse,
  KnowledgeCardByScrapResponse,
  KnowledgeCardCreateRequest,
  KnowledgeCardDetailResponse,
  KnowledgeCardListResponse,
  KnowledgeCardListParams,
  KnowledgeCardResponse,
  KnowledgeCardSimilarCardsResponse,
  KnowledgeCardView,
  SearchCardResult,
  SearchParams,
  SearchResponse,
  Tag,
  TagResponse,
} from './knowledge';
export type {
  TilGenerateRequest,
  TilGenerationJobResponse,
  TilGithubCommitJobResponse,
  TilGithubCommitStatus,
  TilRecallCardsResponse,
  TilResponse,
  TilSourceContentResponse,
  TilSourcesResponse,
  TilUpdateRequest,
} from './til';
export { toKnowledgeCardView } from './knowledge';
