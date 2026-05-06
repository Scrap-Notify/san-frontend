import type { AxiosInstance } from 'axios';
import { unwrapApiResponse, type ApiResponse } from './client';
import type {
  GetCardsParams,
  GetCardsResponse,
  KnowledgeCardAnalysisJobResponse,
  KnowledgeCardCreateRequest,
  KnowledgeCardSimilarCardsResponse,
  KnowledgeCardView,
} from '../types';

export function createCardsApi(apiClient: AxiosInstance) {
  return {
    create: (payload: KnowledgeCardCreateRequest): Promise<KnowledgeCardAnalysisJobResponse> =>
      apiClient
        .post<ApiResponse<KnowledgeCardAnalysisJobResponse>>('/cards', payload)
        .then((response) => unwrapApiResponse(response.data)),

    getAll: (params?: GetCardsParams): Promise<GetCardsResponse> =>
      apiClient
        .get<ApiResponse<GetCardsResponse>>('/cards', { params })
        .then((response) => unwrapApiResponse(response.data)),

    getSimilarByJob: (jobId: string): Promise<KnowledgeCardSimilarCardsResponse> =>
      apiClient
        .get<ApiResponse<KnowledgeCardSimilarCardsResponse>>(`/cards/jobs/${jobId}/similar-cards`)
        .then((response) => unwrapApiResponse(response.data)),

    getById: (cardId: string): Promise<KnowledgeCardView> =>
      apiClient
        .get<ApiResponse<KnowledgeCardView>>(`/cards/${cardId}`)
        .then((response) => unwrapApiResponse(response.data)),

    delete: (cardId: string): Promise<void> =>
      apiClient.delete<ApiResponse<void>>(`/cards/${cardId}`).then(() => undefined),
  };
}

export type CardsApi = ReturnType<typeof createCardsApi>;
