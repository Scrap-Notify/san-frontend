import {
  createApiClient,
  createAsyncJobsApi,
  createCardsApi,
  createScrapsApi,
  type AuthTokens,
  type TokenProvider,
} from '@san/shared';

const defaultBaseURL = import.meta.env.PROD
  ? 'https://k14a309.p.ssafy.io/api'
  : 'http://localhost:8080/api';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? defaultBaseURL;

const ACCESS_TOKEN_KEY = 'san_access_token';
const REFRESH_TOKEN_KEY = 'san_refresh_token';

async function getStorageValue(key: string): Promise<string | null> {
  const stored = await chrome.storage.local.get(key);
  return typeof stored[key] === 'string' ? stored[key] : null;
}

const tokenProvider: TokenProvider = {
  getToken: () => getStorageValue(ACCESS_TOKEN_KEY),
  getRefreshToken: () => getStorageValue(REFRESH_TOKEN_KEY),
  setTokens: async ({ accessToken, refreshToken }: AuthTokens) => {
    await chrome.storage.local.set({
      [ACCESS_TOKEN_KEY]: accessToken,
      [REFRESH_TOKEN_KEY]: refreshToken,
    });
  },
  clearToken: async () => {
    await chrome.storage.local.remove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  },
};

const apiClient = createApiClient(baseURL, tokenProvider);

export const scrapsApi = createScrapsApi(apiClient);
export const cardsApi = createCardsApi(apiClient);
export const asyncJobsApi = createAsyncJobsApi(apiClient);
export const authTokenStorage = tokenProvider;
