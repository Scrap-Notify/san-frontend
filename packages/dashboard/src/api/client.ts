import {
  createApiClient,
  createAuthApi,
  createCardsApi,
  createScrapsApi,
  type AuthTokens,
} from '@san/shared';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

const ACCESS_TOKEN_KEY = 'san_access_token';
const REFRESH_TOKEN_KEY = 'san_refresh_token';

const tokenProvider = {
  getToken: async () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: async () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: async ({ accessToken, refreshToken }: AuthTokens) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearToken: async () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

const apiClient = createApiClient(baseURL, tokenProvider);

export const authApi = createAuthApi(apiClient);
export const scrapsApi = createScrapsApi(apiClient);
export const cardsApi = createCardsApi(apiClient);
export const authTokenStorage = tokenProvider;
