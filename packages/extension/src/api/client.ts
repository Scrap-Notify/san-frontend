import {
  createApiClient,
  createAsyncJobsApi,
  createAuthApi,
  createCardsApi,
  createFeedbackApi,
  createS3Api,
  createSearchApi,
  createScrapsApi,
  type AuthTokens,
  type TokenResponse,
  type TokenProvider,
} from '@san/shared';
import { runAuthRefreshLock } from './authRefreshLock';

const defaultBaseURL = import.meta.env.PROD
  ? 'https://k14a309.p.ssafy.io/api'
  : 'http://localhost:8080/api';
const baseURL = normalizeApiBaseURL(import.meta.env.VITE_API_BASE_URL ?? defaultBaseURL);

function normalizeApiBaseURL(value: string) {
  const trimmed = value.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const ACCESS_TOKEN_KEY = 'san_access_token';
const REFRESH_TOKEN_KEY = 'san_refresh_token';
const SESSION_ID_KEY = 'san_session_id';
const CLIENT_TYPE_KEY = 'san_client_type';
const ACCESS_TOKEN_EXPIRES_AT_KEY = 'san_access_token_expires_at';

async function getStorageValue(key: string): Promise<string | null> {
  const stored = await chrome.storage.local.get(key);
  return typeof stored[key] === 'string' ? stored[key] : null;
}

async function getStoredTokenResponse(): Promise<TokenResponse | null> {
  const [accessToken, refreshToken, sessionId, expiresAt] = await Promise.all([
    getStorageValue(ACCESS_TOKEN_KEY),
    getStorageValue(REFRESH_TOKEN_KEY),
    getStorageValue(SESSION_ID_KEY),
    getStorageValue(ACCESS_TOKEN_EXPIRES_AT_KEY),
  ]);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: expiresAt ? Math.max(0, Math.floor((Number(expiresAt) - Date.now()) / 1000)) : 0,
    sessionId: sessionId ?? '',
  };
}

const tokenProvider: TokenProvider = {
  getToken: () => getStorageValue(ACCESS_TOKEN_KEY),
  getRefreshToken: () => getStorageValue(REFRESH_TOKEN_KEY),
  getAccessTokenExpiresAt: async () => {
    const value = await getStorageValue(ACCESS_TOKEN_EXPIRES_AT_KEY);
    return value ? Number(value) : null;
  },
  setTokens: async ({ accessToken, refreshToken, sessionId, clientType, expiresIn }: AuthTokens) => {
    await chrome.storage.local.set({
      [ACCESS_TOKEN_KEY]: accessToken,
      [REFRESH_TOKEN_KEY]: refreshToken,
      [CLIENT_TYPE_KEY]: clientType ?? 'EXTENSION',
      ...(sessionId ? { [SESSION_ID_KEY]: sessionId } : {}),
    });

    if (expiresIn) {
      await chrome.storage.local.set({
        [ACCESS_TOKEN_EXPIRES_AT_KEY]: String(Date.now() + expiresIn * 1000),
      });
    } else {
      await chrome.storage.local.remove(ACCESS_TOKEN_EXPIRES_AT_KEY);
    }
  },
  refreshWithLock: async (
    refreshTokenAtStart: string,
    refresh: (refreshToken: string) => Promise<TokenResponse>,
    getStoredTokens: () => Promise<TokenResponse | null>
  ) => runAuthRefreshLock(async () => {
    const latestRefreshToken = await getStorageValue(REFRESH_TOKEN_KEY);
    if (!latestRefreshToken) {
      throw new Error('Missing refresh token');
    }

    if (latestRefreshToken !== refreshTokenAtStart) {
      const tokens = (await getStoredTokenResponse()) ?? (await getStoredTokens());
      if (tokens) {
        return tokens;
      }
    }

    return refresh(latestRefreshToken);
  }),
  clearToken: async () => {
    await chrome.storage.local.remove([
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      SESSION_ID_KEY,
      CLIENT_TYPE_KEY,
      ACCESS_TOKEN_EXPIRES_AT_KEY,
    ]);
  },
};

const apiClient = createApiClient(baseURL, tokenProvider);

export const authApi = createAuthApi(apiClient);
export const scrapsApi = createScrapsApi(apiClient);
export const s3Api = createS3Api(apiClient);
export const cardsApi = createCardsApi(apiClient);
export const searchApi = createSearchApi(apiClient);
export const asyncJobsApi = createAsyncJobsApi(apiClient);
export const feedbackApi = createFeedbackApi(apiClient);
export const authTokenStorage = tokenProvider;
