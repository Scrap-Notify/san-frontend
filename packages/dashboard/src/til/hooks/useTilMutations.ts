import { useMutation } from '@tanstack/react-query';
import type { TilGenerationJobResponse, TilGithubCommitJobResponse } from '@san/shared';
import { tilApi } from '../../api/client';

interface UseTilGenerateMutationOptions {
  targetDate: string;
  onSuccess?: (response: TilGenerationJobResponse) => void;
}

export function useTilGenerateMutation({ targetDate, onSuccess }: UseTilGenerateMutationOptions) {
  return useMutation({
    mutationFn: () => tilApi.generate({ targetDate }),
    onSuccess,
  });
}

interface UseTilGithubCommitMutationOptions {
  onSuccess?: (response: TilGithubCommitJobResponse) => void;
}

export function useTilGithubCommitMutation({ onSuccess }: UseTilGithubCommitMutationOptions = {}) {
  return useMutation({
    mutationFn: (summaryId: string) => tilApi.commitToGithub(summaryId),
    onSuccess,
  });
}
