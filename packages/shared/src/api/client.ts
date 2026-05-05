import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

export const SKIP_AUTH_HEADER = 'X-SAN-Skip-Auth';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenProvider {
  getToken: () => Promise<string | null>;
  getRefreshToken?: () => Promise<string | null>;
  setTokens?: (tokens: AuthTokens) => Promise<void>;
  clearToken: () => Promise<void>;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface TokenResponse extends AuthTokens {
  tokenType: 'Bearer' | string;
  expiresIn: number;
}

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _skipAuth?: boolean;
}

export function createApiClient(baseURL: string, tokenProvider: TokenProvider) {
  const client = axios.create({
    baseURL,
    timeout: 10_000,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use(
    async (config) => {
      const skipAuth = config.headers?.[SKIP_AUTH_HEADER];
      if (skipAuth) {
        (config as RetriableRequestConfig)._skipAuth = true;
        delete config.headers[SKIP_AUTH_HEADER];
        return config;
      }

      const token = await tokenProvider.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetriableRequestConfig | undefined;

      if (originalRequest?._skipAuth) {
        return Promise.reject(error);
      }

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        tokenProvider.getRefreshToken &&
        tokenProvider.setTokens
      ) {
        originalRequest._retry = true;

        try {
          const refreshToken = await tokenProvider.getRefreshToken();
          if (!refreshToken) {
            throw new Error('Missing refresh token');
          }

          const response = await axios.post<ApiResponse<TokenResponse>>(
            '/auth/reissue',
            { refreshToken },
            {
              baseURL,
              headers: { 'Content-Type': 'application/json' },
            }
          );

          const tokens = unwrapApiResponse(response.data);
          await tokenProvider.setTokens(tokens);
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;

          return client(originalRequest);
        } catch (refreshError) {
          await tokenProvider.clearToken();
          return Promise.reject(refreshError);
        }
      }

      if (error.response?.status === 401) {
        await tokenProvider.clearToken();
      }

      return Promise.reject(error);
    }
  );

  return client;
}

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.ok || response.data === undefined) {
    throw new Error(response.message ?? response.error ?? 'API request failed');
  }

  return response.data;
}

export function getApiErrorMessage(error: unknown, fallback = 'Request failed') {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    const response = error.response?.data;
    return response?.message ?? response?.error ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
