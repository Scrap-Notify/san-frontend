import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage, type KnowledgeCardResponse, type TilResponse } from '@san/shared';
import { asyncJobsApi, tilApi } from '../../api/client';

type JobTone = 'idle' | 'pending' | 'success' | 'error';

export function useTilPageLogic() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(() => getPreviousDate());
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [generationJobId, setGenerationJobId] = useState<string | null>(null);
  const [commitJobId, setCommitJobId] = useState<string | null>(null);

  const tilQuery = useQuery({
    queryKey: ['til', selectedDate],
    queryFn: () => tilApi.getByDate(selectedDate),
  });

  const tilList = tilQuery.data ?? [];
  const selectedTil = useMemo(
    () => tilList.find((item) => item.summaryId === selectedSummaryId) ?? tilList[0] ?? null,
    [selectedSummaryId, tilList],
  );

  useEffect(() => {
    setSelectedSummaryId(null);
    setGenerationJobId(null);
    setCommitJobId(null);
  }, [selectedDate]);

  useEffect(() => {
    setDraft(selectedTil?.content ?? '');
  }, [selectedTil?.summaryId, selectedTil?.content]);

  const recallCardsQuery = useQuery({
    queryKey: ['til-recall-cards', selectedTil?.summaryId],
    queryFn: () => tilApi.getRecallCards(selectedTil?.summaryId ?? ''),
    enabled: Boolean(selectedTil?.summaryId),
  });

  const generationStatusQuery = useQuery({
    queryKey: ['async-job', generationJobId],
    queryFn: () => asyncJobsApi.getStatus(generationJobId ?? ''),
    enabled: Boolean(generationJobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PENDING' || status === 'PROCESSING' ? 1500 : false;
    },
  });

  const commitStatusQuery = useQuery({
    queryKey: ['async-job', commitJobId],
    queryFn: () => asyncJobsApi.getStatus(commitJobId ?? ''),
    enabled: Boolean(commitJobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PENDING' || status === 'PROCESSING' ? 1500 : false;
    },
  });

  useEffect(() => {
    if (generationStatusQuery.data?.status === 'COMPLETED') {
      void queryClient.invalidateQueries({ queryKey: ['til', selectedDate] });
    }
  }, [generationStatusQuery.data?.status, queryClient, selectedDate]);

  const generateMutation = useMutation({
    mutationFn: () => tilApi.generate({ targetDate: selectedDate }),
    onSuccess: (response) => {
      setGenerationJobId(response.jobId);
      setSelectedSummaryId(response.summaryId);
    },
  });

  const commitMutation = useMutation({
    mutationFn: (summaryId: string) => tilApi.commitToGithub(summaryId),
    onSuccess: (response) => {
      setCommitJobId(response.jobId);
    },
  });

  const generationTone = getJobTone(
    generationJobId,
    generationStatusQuery.data?.status,
    generateMutation.isPending,
    generateMutation.isError || generationStatusQuery.data?.status === 'FAILED',
  );
  const commitTone = getJobTone(
    commitJobId,
    commitStatusQuery.data?.status,
    commitMutation.isPending,
    commitMutation.isError || commitStatusQuery.data?.status === 'FAILED',
  );

  const generationMessage = getGenerationMessage(
    generationJobId,
    generationStatusQuery.data?.status,
    generationStatusQuery.data?.errorMessage,
    generateMutation.error,
  );

  const commitMessage = getCommitMessage(
    commitJobId,
    commitStatusQuery.data?.status,
    commitStatusQuery.data?.errorMessage,
    commitMutation.error,
  );

  return {
    selectedDate,
    setSelectedDate,
    selectedSummaryId,
    setSelectedSummaryId,
    draft,
    setDraft,
    tilList,
    selectedTil,
    recallCardsQuery,
    generationStatusQuery,
    commitStatusQuery,
    generateMutation,
    commitMutation,
    generationTone,
    commitTone,
    generationMessage,
    commitMessage,
  };
}

function getPreviousDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isRunning(status?: string) {
  return status === 'PENDING' || status === 'PROCESSING';
}

function getJobTone(
  jobId: string | null,
  status: string | undefined,
  isPending: boolean,
  isError: boolean,
): JobTone {
  if (isError) return 'error';
  if (isPending || isRunning(status)) return 'pending';
  if (jobId && status === 'COMPLETED') return 'success';
  return 'idle';
}

function getGenerationMessage(
  jobId: string | null,
  status: string | undefined,
  errorMessage: string | null | undefined,
  error: unknown,
) {
  if (error) return getApiErrorMessage(error, 'TIL 생성 요청에 실패했습니다.');
  if (status === 'FAILED') return errorMessage ?? 'TIL 생성 작업이 실패했습니다.';
  if (status === 'COMPLETED') return 'TIL 생성이 완료되었습니다.';
  if (status === 'PROCESSING') return 'AI가 TIL을 생성하고 있습니다.';
  if (status === 'PENDING' || jobId) return 'TIL 생성 작업이 등록되었습니다.';
  return null;
}

function getCommitMessage(
  jobId: string | null,
  status: string | undefined,
  errorMessage: string | null | undefined,
  error: unknown,
) {
  if (error) return getApiErrorMessage(error, 'GitHub 커밋 요청에 실패했습니다.');
  if (status === 'FAILED') return errorMessage ?? 'GitHub 커밋 작업이 실패했습니다.';
  if (status === 'COMPLETED') return 'GitHub 커밋이 완료되었습니다.';
  if (status === 'PROCESSING') return 'GitHub 커밋을 처리하고 있습니다.';
  if (status === 'PENDING' || jobId) return 'GitHub 커밋 작업이 등록되었습니다.';
  return null;
}