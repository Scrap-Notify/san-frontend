import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@san/shared';
import type { TilJobTone, TilPageLogic } from '../types';
import { useTilGenerateMutation, useTilGithubCommitMutation } from './useTilMutations';
import { tilKeys, useTilAsyncJobStatus, useTilByDate, useTilRecallCards } from './useTilQueries';

export function useTilPageLogic(): TilPageLogic {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(() => getPreviousDate());
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [generationJobId, setGenerationJobId] = useState<string | null>(null);
  const [commitJobId, setCommitJobId] = useState<string | null>(null);

  const tilQuery = useTilByDate(selectedDate);

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

  const recallCardsQuery = useTilRecallCards(selectedTil?.summaryId);
  const generationStatusQuery = useTilAsyncJobStatus(generationJobId);
  const commitStatusQuery = useTilAsyncJobStatus(commitJobId);

  useEffect(() => {
    if (generationStatusQuery.data?.status === 'COMPLETED') {
      void queryClient.invalidateQueries({ queryKey: tilKeys.byDate(selectedDate) });
    }
  }, [generationStatusQuery.data?.status, queryClient, selectedDate]);

  const generateMutation = useTilGenerateMutation({
    targetDate: selectedDate,
    onSuccess: (response) => {
      setGenerationJobId(response.jobId);
      setSelectedSummaryId(response.summaryId);
    },
  });

  const commitMutation = useTilGithubCommitMutation({
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
    tilQuery,
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
): TilJobTone {
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
