import type { AuthTokens, TokenResponse } from '@san/shared';

const ACCESS_TOKEN_KEY = 'san_access_token';
const REFRESH_TOKEN_KEY = 'san_refresh_token';
const SESSION_ID_KEY = 'san_session_id';
const CLIENT_TYPE_KEY = 'san_client_type';
const USERNAME_KEY = 'san_username';
const ACCESS_TOKEN_EXPIRES_AT_KEY = 'san_access_token_expires_at';
const REFRESH_LOCK_NAME = 'san-auth-refresh';
const REFRESH_LOCK_KEY = 'san_auth_refresh_lock';
const REFRESH_LOCK_TTL_MS = 12_000;
const REFRESH_LOCK_WAIT_MS = 10_000;

function getAccessTokenExpiresAt(expiresIn?: number) {
  return expiresIn ? String(Date.now() + expiresIn * 1000) : null;
}

function createStoredTokenResponse(): TokenResponse | null {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!accessToken || !refreshToken) {
    return null;
  }

  const expiresAt = localStorage.getItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: expiresAt ? Math.max(0, Math.floor((Number(expiresAt) - Date.now()) / 1000)) : 0,
    sessionId: localStorage.getItem(SESSION_ID_KEY) ?? '',
  };
}

function getNavigatorLocks() {
  return (globalThis.navigator as Navigator & {
    locks?: {
      request: <T>(name: string, callback: () => Promise<T>) => Promise<T>;
    };
  }).locks;
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function withLocalStorageRefreshLock<T>(task: () => Promise<T>): Promise<T> {
  const owner = `${Date.now()}-${crypto.randomUUID?.() ?? Math.random().toString(16).slice(2)}`;
  const deadline = Date.now() + REFRESH_LOCK_WAIT_MS;

  while (Date.now() < deadline) {
    const rawLock = localStorage.getItem(REFRESH_LOCK_KEY);
    const lock = rawLock ? safeParseLock(rawLock) : null;

    if (!lock || lock.expiresAt <= Date.now()) {
      localStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify({ owner, expiresAt: Date.now() + REFRESH_LOCK_TTL_MS }));
      await sleep(20);
      if (safeParseLock(localStorage.getItem(REFRESH_LOCK_KEY))?.owner === owner) {
        try {
          return await task();
        } finally {
          if (safeParseLock(localStorage.getItem(REFRESH_LOCK_KEY))?.owner === owner) {
            localStorage.removeItem(REFRESH_LOCK_KEY);
          }
        }
      }
    }

    await sleep(80 + Math.floor(Math.random() * 80));
  }

  throw new Error('Timed out waiting for auth refresh lock');
}

function safeParseLock(value: string | null): { owner: string; expiresAt: number } | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<{ owner: string; expiresAt: number }>;
    return typeof parsed.owner === 'string' && typeof parsed.expiresAt === 'number'
      ? { owner: parsed.owner, expiresAt: parsed.expiresAt }
      : null;
  } catch {
    return null;
  }
}

async function runRefreshLock<T>(task: () => Promise<T>) {
  const locks = getNavigatorLocks();
  if (locks) {
    return locks.request(REFRESH_LOCK_NAME, task);
  }

  return withLocalStorageRefreshLock(task);
}

export const authTokenStorage = {
  getToken: async () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: async () => localStorage.getItem(REFRESH_TOKEN_KEY),
  getAccessTokenExpiresAt: async () => {
    const value = localStorage.getItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
    return value ? Number(value) : null;
  },
  getUsername: async () => localStorage.getItem(USERNAME_KEY),
  setTokens: async ({ accessToken, refreshToken, sessionId, clientType, expiresIn }: AuthTokens) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(CLIENT_TYPE_KEY, clientType ?? 'DASHBOARD');
    const expiresAt = getAccessTokenExpiresAt(expiresIn);
    if (expiresAt) {
      localStorage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, expiresAt);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
    }
    if (sessionId) {
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
  },
  setUsername: async (username: string) => {
    localStorage.setItem(USERNAME_KEY, username);
  },
  refreshWithLock: async (
    refreshTokenAtStart: string,
    refresh: (refreshToken: string) => Promise<TokenResponse>,
    getStoredTokens: () => Promise<TokenResponse | null>
  ) => runRefreshLock(async () => {
    const latestRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!latestRefreshToken) {
      throw new Error('Missing refresh token');
    }

    if (latestRefreshToken !== refreshTokenAtStart) {
      const tokens = createStoredTokenResponse() ?? (await getStoredTokens());
      if (tokens) {
        return tokens;
      }
    }

    return refresh(latestRefreshToken);
  }),
  clearToken: async () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(SESSION_ID_KEY);
    localStorage.removeItem(CLIENT_TYPE_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
  },
};
