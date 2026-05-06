import type { AuthTokens } from '@san/shared';
import { authTokenStorage } from './tokenStorage';

const AUTH_SYNC_MESSAGE = 'SAN_AUTH_SYNC';
const AUTH_CLEAR_MESSAGE = 'SAN_AUTH_CLEAR';
const DEBUG_PREFIX = '[SAN:extension-auth]';
const DASHBOARD_MESSAGE_SOURCE = 'SAN_DASHBOARD';
const EXTENSION_MESSAGE_SOURCE = 'SAN_EXTENSION';
const BRIDGE_TIMEOUT_MS = 3000;

interface ChromeRuntimeBridge {
  runtime?: {
    sendMessage?: (
      extensionId: string,
      message: unknown,
      callback?: (response?: unknown) => void
    ) => void;
    lastError?: { message?: string };
  };
}

interface ExtensionMessageResponse {
  ok?: boolean;
  hasAccessToken?: boolean;
  hasRefreshToken?: boolean;
}

interface ExtensionBridgeResponseMessage {
  source?: unknown;
  requestId?: unknown;
  response?: unknown;
}

declare global {
  interface Window {
    chrome?: ChromeRuntimeBridge;
  }
}

export async function syncExtensionAuth(tokens: AuthTokens): Promise<void> {
  const message = {
    type: AUTH_SYNC_MESSAGE,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };

  await deliverExtensionAuthMessage(message, true);
}

export async function clearExtensionAuth(): Promise<void> {
  const message = { type: AUTH_CLEAR_MESSAGE };

  await deliverExtensionAuthMessage(message, false);
}

export async function syncStoredExtensionAuth(): Promise<void> {
  const [accessToken, refreshToken] = await Promise.all([
    authTokenStorage.getToken(),
    authTokenStorage.getRefreshToken(),
  ]);

  if (!accessToken || !refreshToken) {
    console.info(DEBUG_PREFIX, 'stored auth sync skipped: dashboard tokens are missing', {
      hasAccessToken: Boolean(accessToken),
      hasRefreshToken: Boolean(refreshToken),
    });
    return;
  }

  await syncExtensionAuth({ accessToken, refreshToken });
}

async function deliverExtensionAuthMessage(message: unknown, expectStoredTokens: boolean): Promise<void> {
  console.info(DEBUG_PREFIX, 'extension auth sync started', {
    directRuntimeAvailable: typeof window.chrome?.runtime?.sendMessage === 'function',
    origin: window.location.origin,
  });

  const attempts = [
    sendExtensionMessage(message, expectStoredTokens),
    postDashboardMessage(message, expectStoredTokens),
  ];

  try {
    await waitForFirstConfirmed(attempts);
    console.info(DEBUG_PREFIX, 'extension auth sync confirmed');
  } catch (error) {
    console.warn(DEBUG_PREFIX, 'extension auth sync was not confirmed', {
      errors: error instanceof AuthSyncError ? error.errors : [normalizeError(error)],
    });
  }
}

function waitForFirstConfirmed(attempts: Promise<void>[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const errors: string[] = [];
    let rejectedCount = 0;
    let settled = false;

    attempts.forEach((attempt) => {
      attempt
        .then(() => {
          if (settled) {
            return;
          }

          settled = true;
          resolve();
        })
        .catch((error: unknown) => {
          if (settled) {
            return;
          }

          rejectedCount += 1;
          errors.push(normalizeError(error));

          if (rejectedCount === attempts.length) {
            settled = true;
            reject(new AuthSyncError(errors));
          }
        });
    });
  });
}

async function postDashboardMessage(message: unknown, expectStoredTokens: boolean): Promise<void> {
  const requestId = createRequestId();

  await new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      window.removeEventListener('message', handleBridgeResponse);
      reject(new Error('Timed out waiting for extension content-script bridge'));
    }, BRIDGE_TIMEOUT_MS);

    const handleBridgeResponse = (event: MessageEvent<ExtensionBridgeResponseMessage>) => {
      if (event.source !== window || event.origin !== window.location.origin) {
        return;
      }

      if (
        event.data?.source !== EXTENSION_MESSAGE_SOURCE
        || event.data.requestId !== requestId
      ) {
        return;
      }

      window.clearTimeout(timeoutId);
      window.removeEventListener('message', handleBridgeResponse);

      const response = event.data.response as ExtensionMessageResponse | undefined;
      if (!isConfirmedExtensionResponse(response, expectStoredTokens)) {
        reject(new Error('Extension content-script bridge did not confirm auth storage'));
        return;
      }

      resolve();
    };

    window.addEventListener('message', handleBridgeResponse);
    window.postMessage(
      {
        source: DASHBOARD_MESSAGE_SOURCE,
        requestId,
        payload: message,
      },
      window.location.origin
    );
  });
}

async function sendExtensionMessage(message: unknown, expectStoredTokens: boolean): Promise<void> {
  const extensionId = import.meta.env.VITE_SAN_EXTENSION_ID;

  if (!extensionId || typeof window.chrome?.runtime?.sendMessage !== 'function') {
    throw new Error('Chrome runtime bridge is unavailable');
  }

  await new Promise<void>((resolve, reject) => {
    window.chrome?.runtime?.sendMessage?.(
      extensionId,
      message,
      (response?: unknown) => {
        const lastError = window.chrome?.runtime?.lastError;

        if (lastError?.message) {
          reject(new Error(lastError.message));
          return;
        }

        const extensionResponse = response as ExtensionMessageResponse | undefined;

        if (!isConfirmedExtensionResponse(extensionResponse, expectStoredTokens)) {
          reject(new Error('Extension did not confirm auth storage'));
          return;
        }

        resolve();
      }
    );
  });
}

function createRequestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isConfirmedExtensionResponse(
  response: ExtensionMessageResponse | undefined,
  expectStoredTokens: boolean
) {
  if (response?.ok !== true) {
    return false;
  }

  if (!expectStoredTokens) {
    return true;
  }

  return response.hasAccessToken === true && response.hasRefreshToken === true;
}

class AuthSyncError extends Error {
  errors: string[];

  constructor(errors: string[]) {
    super('Extension auth sync was not confirmed');
    this.errors = errors;
  }
}
