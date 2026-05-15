import { useMutation } from '@tanstack/react-query';
import type { TilGenerationJobResponse, TilGithubCommitJobResponse, TilResponse, TilUpdateRequest } from '@san/shared';
import { tilApi } from '@dashboard/api/client';

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

interface UpdateTilVariables extends TilUpdateRequest {
  summaryId: string;
}

interface UseTilUpdateMutationOptions {
  onSuccess?: (response: TilResponse) => void;
}

export function useTilUpdateMutation({ onSuccess }: UseTilUpdateMutationOptions = {}) {
  return useMutation({
    mutationFn: ({ summaryId, title, content }: UpdateTilVariables) =>
      tilApi.update(summaryId, { title, content }),
    onSuccess,
  });
}

interface UseTilDeleteMutationOptions {
  onSuccess?: (_response: void, summaryId: string) => void;
}

export function useTilDeleteMutation({ onSuccess }: UseTilDeleteMutationOptions = {}) {
  return useMutation({
    mutationFn: (summaryId: string) => tilApi.delete(summaryId),
    onSuccess,
  });
}
