import type { AxiosInstance } from 'axios';
import { unwrapApiResponse, type ApiResponse } from './client';
import type {
  TilGenerateRequest,
  TilGenerationJobResponse,
  TilGithubCommitJobResponse,
  TilRecallCardsResponse,
  TilResponse,
} from '../types';

export function createTilApi(apiClient: AxiosInstance) {
  return {
    generate: (payload: TilGenerateRequest): Promise<TilGenerationJobResponse> =>
      apiClient
        .post<ApiResponse<TilGenerationJobResponse>>('/til', payload)
        .then((response) => unwrapApiResponse(response.data)),

    getByDate: (date: string): Promise<TilResponse[]> =>
      apiClient
        .get<ApiResponse<TilResponse[]>>('/til', { params: { date } })
        .then((response) => unwrapApiResponse(response.data)),

    getRecallCards: (summaryId: string): Promise<TilRecallCardsResponse> =>
      apiClient
        .get<ApiResponse<TilRecallCardsResponse>>(`/til/${summaryId}/recall-cards`)
        .then((response) => unwrapApiResponse(response.data)),

    commitToGithub: (summaryId: string): Promise<TilGithubCommitJobResponse> =>
      apiClient
        .post<ApiResponse<TilGithubCommitJobResponse>>(`/til/${summaryId}/github-commit`)
        .then((response) => unwrapApiResponse(response.data)),
  };
}

export type TilApi = ReturnType<typeof createTilApi>;
