import type { AuthTokens } from '@san/shared';

const ACCESS_TOKEN_KEY = 'san_access_token';
const REFRESH_TOKEN_KEY = 'san_refresh_token';
const SESSION_ID_KEY = 'san_session_id';
const CLIENT_TYPE_KEY = 'san_client_type';

export const authTokenStorage = {
  getToken: async () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: async () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: async ({ accessToken, refreshToken, sessionId, clientType }: AuthTokens) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(CLIENT_TYPE_KEY, clientType ?? 'DASHBOARD');
    if (sessionId) {
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
  },
  clearToken: async () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(SESSION_ID_KEY);
    localStorage.removeItem(CLIENT_TYPE_KEY);
  },
};
