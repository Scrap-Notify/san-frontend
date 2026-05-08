import type { AxiosInstance } from 'axios';
import { unwrapApiResponse, type ApiResponse } from './client';
import type {
  TilGenerateRequest,
  TilGenerationJobResponse,
  TilGithubCommitJobResponse,
  TilRecallCardsResponse,
  TilResponse,
  TilSourcesResponse,
} from '../types';

export function createTilApi(apiClient: AxiosInstance) {
  return {
    generate: (payload: TilGenerateRequest): Promise<TilGenerationJobResponse> =>
      apiClient
        .post<ApiResponse<TilGenerationJobResponse>>('/tils', payload)
        .then((response) => unwrapApiResponse(response.data)),

    getByDate: (date: string): Promise<TilResponse[]> =>
      apiClient
        .get<ApiResponse<TilResponse[]>>('/tils', { params: { date } })
        .then((response) => unwrapApiResponse(response.data)),

    getRecallCards: (summaryId: string): Promise<TilRecallCardsResponse> =>
      apiClient
        .get<ApiResponse<TilRecallCardsResponse>>(`/tils/${summaryId}/recall-cards`)
        .then((response) => unwrapApiResponse(response.data)),

    getSources: (summaryId: string): Promise<TilSourcesResponse> =>
      apiClient
        .get<ApiResponse<TilSourcesResponse>>(`/tils/${summaryId}/source`)
        .then((response) => unwrapApiResponse(response.data)),

    commitToGithub: (summaryId: string): Promise<TilGithubCommitJobResponse> =>
      apiClient
        .post<ApiResponse<TilGithubCommitJobResponse>>(`/til/${summaryId}/github-commit`)
        .then((response) => unwrapApiResponse(response.data)),
  };
}

export type TilApi = ReturnType<typeof createTilApi>;
