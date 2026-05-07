import type { AxiosInstance } from 'axios';
import { unwrapApiResponse, type ApiResponse } from './client';
import type {
  KnowledgeCardAnalysisJobResponse,
  KnowledgeCardCreateRequest,
  KnowledgeCardListResponse,
  KnowledgeCardListParams,
  KnowledgeCardSimilarCardsResponse,
} from '../types';

export function createCardsApi(apiClient: AxiosInstance) {
  return {
    create: (payload: KnowledgeCardCreateRequest): Promise<KnowledgeCardAnalysisJobResponse> =>
      apiClient
        .post<ApiResponse<KnowledgeCardAnalysisJobResponse>>('/cards', payload)
        .then((response) => unwrapApiResponse(response.data)),

    getAll: (params?: KnowledgeCardListParams): Promise<KnowledgeCardListResponse> =>
      apiClient
        .get<ApiResponse<KnowledgeCardListResponse>>('/cards', { params })
        .then((response) => unwrapApiResponse(response.data)),

    getSimilarByJob: (jobId: string): Promise<KnowledgeCardSimilarCardsResponse> =>
      apiClient
        .get<ApiResponse<KnowledgeCardSimilarCardsResponse>>(`/cards/jobs/${jobId}/similar-cards`)
        .then((response) => unwrapApiResponse(response.data)),

  };
}

export type CardsApi = ReturnType<typeof createCardsApi>;
