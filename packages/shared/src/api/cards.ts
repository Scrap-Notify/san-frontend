import type { AxiosInstance } from 'axios';
import { unwrapApiResponse, type ApiResponse } from './client';
import type {
  KnowledgeCardAnalysisJobResponse,
  KnowledgeCardByScrapResponse,
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

    getByScrapId: (scrapId: string): Promise<KnowledgeCardByScrapResponse> =>
      apiClient
        .get<ApiResponse<KnowledgeCardByScrapResponse>>(`/cards/${scrapId}`)
        .then((response) => unwrapApiResponse(response.data)),

    getSimilarByCardId: (cardId: string): Promise<KnowledgeCardSimilarCardsResponse> =>
      apiClient
        .get<ApiResponse<KnowledgeCardSimilarCardsResponse>>(`/cards/${cardId}/similar-cards`)
        .then((response) => unwrapApiResponse(response.data)),

  };
}

export type CardsApi = ReturnType<typeof createCardsApi>;
