import type { AxiosInstance } from 'axios';
import { unwrapApiResponse, type ApiResponse } from './client';

export interface GithubRepository {
  githubRepositoryId: number;
  name: string;
  fullName: string;
  privateRepository: boolean;
  defaultBranch: string;
  htmlUrl: string;
}

export interface GithubRepositoryConnectRequest {
  githubRepositoryId: number;
}

export interface GithubAuthorizeUrlResponse {
  redirectUrl: string;
}

export function createGithubApi(apiClient: AxiosInstance) {
  return {
    getLinkAuthorizeUrl: (): Promise<string> =>
      apiClient
        .get<ApiResponse<GithubAuthorizeUrlResponse>>('/github/link/authorize-url')
        .then((response) => unwrapApiResponse(response.data).redirectUrl),

    unlinkAccount: (): Promise<void> =>
      apiClient.delete<ApiResponse<void>>('/github/link').then(() => undefined),

    getRepositories: (): Promise<GithubRepository[]> =>
      apiClient
        .get<ApiResponse<GithubRepository[]>>('/github/repositories')
        .then((response) => unwrapApiResponse(response.data)),

    getConnectedRepositories: (): Promise<GithubRepository[]> =>
      apiClient
        .get<ApiResponse<GithubRepository[]>>('/github/repositories/connected')
        .then((response) => unwrapApiResponse(response.data)),

    connectRepository: (
      payload: GithubRepositoryConnectRequest
    ): Promise<GithubRepository> =>
      apiClient
        .post<ApiResponse<GithubRepository>>('/github/repositories/connect', payload)
        .then((response) => unwrapApiResponse(response.data)),

    disconnectRepository: (repositoryId: number): Promise<void> =>
      apiClient.delete<ApiResponse<void>>(`/github/repositories/${repositoryId}`).then(() => undefined),
  };
}

export type GithubApi = ReturnType<typeof createGithubApi>;
