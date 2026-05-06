import {
  createApiClient,
  createAuthApi,
  createCardsApi,
  createGithubApi,
  createScrapsApi,
  type AuthTokens,
} from '@san/shared';
import { clearExtensionAuth, syncExtensionAuth } from './extensionAuth';
import { authTokenStorage as localAuthTokenStorage } from './tokenStorage';

const defaultBaseURL = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:8080/api';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? defaultBaseURL;

const tokenProvider = {
  getToken: localAuthTokenStorage.getToken,
  getRefreshToken: localAuthTokenStorage.getRefreshToken,
  setTokens: async (tokens: AuthTokens) => {
    await localAuthTokenStorage.setTokens(tokens);
    void syncExtensionAuth(tokens);
  },
  clearToken: async () => {
    await localAuthTokenStorage.clearToken();
    void clearExtensionAuth();
  },
};

const apiClient = createApiClient(baseURL, tokenProvider);

export const authApi = createAuthApi(apiClient);
export const githubApi = createGithubApi(apiClient);
export const scrapsApi = createScrapsApi(apiClient);
export const cardsApi = createCardsApi(apiClient);
export const authTokenStorage = tokenProvider;
