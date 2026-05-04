import type { AxiosInstance } from 'axios';
import { unwrapApiResponse, type ApiResponse, type TokenResponse } from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  password: string;
}

export interface ReissueRequest {
  refreshToken: string;
}

export interface SignupResponse {
  userId: string;
  username: string;
  provider: 'LOCAL' | 'GITHUB' | string;
  createdAt: string;
}

export function createAuthApi(apiClient: AxiosInstance) {
  return {
    checkUsername: (username: string): Promise<void> =>
      apiClient
        .get<ApiResponse<void>>('/api/auth/check-username', { params: { username } })
        .then((response) => {
          if (!response.data.ok) {
            throw new Error(response.data.message ?? response.data.error ?? 'Username is unavailable');
          }
        }),

    signup: (payload: SignupRequest): Promise<SignupResponse> =>
      apiClient
        .post<ApiResponse<SignupResponse>>('/api/auth/signup', payload)
        .then((response) => unwrapApiResponse(response.data)),

    login: (payload: LoginRequest): Promise<TokenResponse> =>
      apiClient
        .post<ApiResponse<TokenResponse>>('/api/auth/login', payload)
        .then((response) => unwrapApiResponse(response.data)),

    reissue: (payload: ReissueRequest): Promise<TokenResponse> =>
      apiClient
        .post<ApiResponse<TokenResponse>>('/api/auth/reissue', payload)
        .then((response) => unwrapApiResponse(response.data)),

    logout: (): Promise<void> =>
      apiClient.post<ApiResponse<void>>('/api/auth/logout').then(() => undefined),
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
