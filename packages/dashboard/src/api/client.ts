import { createApiClient, createCardsApi, createScrapsApi } from '@san/shared';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

const tokenProvider = {
  getToken: async () => localStorage.getItem('san_access_token'),
  clearToken: async () => {
    localStorage.removeItem('san_access_token');
  },
};

const apiClient = createApiClient(baseURL, tokenProvider);

export const scrapsApi = createScrapsApi(apiClient);
export const cardsApi = createCardsApi(apiClient);
