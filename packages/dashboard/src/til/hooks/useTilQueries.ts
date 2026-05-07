import { useQuery } from '@tanstack/react-query';
import { asyncJobsApi, tilApi } from '../../api/client';

export const tilKeys = {
  all: ['til'] as const,
  byDate: (date: string) => [...tilKeys.all, date] as const,
  recallCards: (summaryId: string | null | undefined) => [...tilKeys.all, 'recall-cards', summaryId] as const,
  asyncJob: (jobId: string | null | undefined) => ['async-job', jobId] as const,
};

export function useTilByDate(date: string) {
  return useQuery({
    queryKey: tilKeys.byDate(date),
    queryFn: () => tilApi.getByDate(date),
  });
}

export function useTilRecallCards(summaryId: string | null | undefined) {
  return useQuery({
    queryKey: tilKeys.recallCards(summaryId),
    queryFn: () => tilApi.getRecallCards(summaryId ?? ''),
    enabled: Boolean(summaryId),
  });
}

export function useTilAsyncJobStatus(jobId: string | null | undefined) {
  return useQuery({
    queryKey: tilKeys.asyncJob(jobId),
    queryFn: () => asyncJobsApi.getStatus(jobId ?? ''),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PENDING' || status === 'PROCESSING' ? 1500 : false;
    },
  });
}
