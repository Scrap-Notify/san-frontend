import type { AxiosInstance } from 'axios';

export interface StatisticsOverview {
  totalKnowledgeCardCount: number;
  todayKnowledgeCardCount: number;
  totalTilCount: number;
}

interface StatisticsApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

function unwrapStatisticsResponse<T>(response: StatisticsApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.error ?? 'Statistics request failed');
  }

  return response.data;
}

export function createStatisticsApi(apiClient: AxiosInstance) {
  return {
    getOverview: (): Promise<StatisticsOverview> =>
      apiClient
        .get<StatisticsApiResponse<StatisticsOverview>>('/statistics/overview')
        .then((response) => unwrapStatisticsResponse(response.data)),
  };
}

export type StatisticsApi = ReturnType<typeof createStatisticsApi>;
