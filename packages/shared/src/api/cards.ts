import type { AxiosInstance } from 'axios';
import { unwrapApiResponse, type ApiResponse } from './client';
import type {
  KnowledgeCardAnalysisJobResponse,
  KnowledgeCardByScrapResponse,
  KnowledgeCardCreateRequest,
  KnowledgeCardListResponse,
  KnowledgeCardListParams,
  KnowledgeCardResponse,
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
        .get<ApiResponse<KnowledgeCardByScrapResponse | KnowledgeCardResponse>>(`/cards/${scrapId}`)
        .then((response) => normalizeCardByScrapResponse(unwrapApiResponse(response.data))),

    getSimilarByCardId: (cardId: string): Promise<KnowledgeCardSimilarCardsResponse> =>
      apiClient
        .get<ApiResponse<KnowledgeCardSimilarCardsResponse>>(`/cards/${cardId}/similar-cards`)
        .then((response) => unwrapApiResponse(response.data)),

    getSimilarByJob: (jobId: string): Promise<KnowledgeCardSimilarCardsResponse> =>
      apiClient
        .get<ApiResponse<KnowledgeCardSimilarCardsResponse>>(`/cards/jobs/${jobId}/similar-cards`)
        .then((response) => unwrapApiResponse(response.data)),

  };
}

function normalizeCardByScrapResponse(
  response: KnowledgeCardByScrapResponse | KnowledgeCardResponse
): KnowledgeCardByScrapResponse {
  if ('cardId' in response && !('title' in response)) {
    return response;
  }

  return {
    cardId: response.cardId,
    card: response,
  };
}

export type CardsApi = ReturnType<typeof createCardsApi>;
