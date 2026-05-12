import type { AxiosInstance } from 'axios';
import {
  SKIP_AUTH_HEADER,
  unwrapApiResponse,
  type ApiResponse,
  type TokenResponse,
} from './client';

export type ClientType = 'DASHBOARD' | 'EXTENSION';

export interface LoginRequest {
  username: string;
  password: string;
  clientType: ClientType;
}

export interface SignupRequest {
  username: string;
  password: string;
}

export interface ReissueRequest {
  refreshToken: string;
}

export interface GithubTokenExchangeRequest {
  ticket: string;
}

export interface GithubLoginRequest {
  code: string;
  clientType: ClientType;
}

export interface WithdrawRequest {
  password: string;
}

export interface SignupResponse {
  userId: string;
  username: string;
  provider: 'LOCAL' | 'GITHUB' | string;
  createdAt: string;
}

export function createAuthApi(apiClient: AxiosInstance) {
  const publicRequest = {
    headers: { [SKIP_AUTH_HEADER]: 'true' },
  };

  return {
    checkUsername: (username: string): Promise<void> =>
      apiClient
        .get<ApiResponse<void>>('/auth/check-username', {
          ...publicRequest,
          params: { username },
        })
        .then((response) => {
          if (!response.data.ok) {
            throw new Error(response.data.message ?? response.data.error ?? 'Username is unavailable');
          }
        }),

    signup: (payload: SignupRequest): Promise<SignupResponse> =>
      apiClient
        .post<ApiResponse<SignupResponse>>('/auth/signup', payload, publicRequest)
        .then((response) => unwrapApiResponse(response.data)),

    login: (payload: LoginRequest): Promise<TokenResponse> =>
      apiClient
        .post<ApiResponse<TokenResponse>>('/auth/login', payload, publicRequest)
        .then((response) => unwrapApiResponse(response.data)),

    reissue: (payload: ReissueRequest): Promise<TokenResponse> =>
      apiClient
        .post<ApiResponse<TokenResponse>>('/auth/reissue', payload, publicRequest)
        .then((response) => unwrapApiResponse(response.data)),

    getGithubAuthorizeUrl: (clientType: ClientType): string =>
      apiClient.getUri({ url: '/auth/github/authorize', params: { clientType } }),

    loginWithGithubCode: (payload: GithubLoginRequest): Promise<TokenResponse> =>
      apiClient
        .post<ApiResponse<TokenResponse>>('/auth/github/login', payload, publicRequest)
        .then((response) => unwrapApiResponse(response.data)),

    exchangeGithubToken: (payload: GithubTokenExchangeRequest): Promise<TokenResponse> =>
      apiClient
        .post<ApiResponse<TokenResponse>>('/auth/github/token', payload, publicRequest)
        .then((response) => unwrapApiResponse(response.data)),

    logout: (): Promise<void> =>
      apiClient.post<ApiResponse<void>>('/auth/logout').then(() => undefined),

    withdraw: (payload: WithdrawRequest): Promise<void> =>
      apiClient.delete<ApiResponse<void>>('/auth/withdraw', { data: payload }).then(() => undefined),
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
