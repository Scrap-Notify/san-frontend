import type { AuthTokens } from '@san/shared';

const AUTH_SYNC_MESSAGE = 'SAN_AUTH_SYNC';
const AUTH_CLEAR_MESSAGE = 'SAN_AUTH_CLEAR';
const DEBUG_PREFIX = '[SAN:extension-auth]';
const DASHBOARD_MESSAGE_SOURCE = 'SAN_DASHBOARD';

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

  postDashboardMessage(message);
  await sendExtensionMessage(message);
}

export async function clearExtensionAuth(): Promise<void> {
  const message = { type: AUTH_CLEAR_MESSAGE };

  postDashboardMessage(message);
  await sendExtensionMessage(message);
}

function postDashboardMessage(message: unknown) {
  window.postMessage(
    {
      source: DASHBOARD_MESSAGE_SOURCE,
      payload: message,
    },
    window.location.origin
  );
}

async function sendExtensionMessage(message: unknown): Promise<void> {
  const extensionId = import.meta.env.VITE_SAN_EXTENSION_ID;

  if (!extensionId || typeof window.chrome?.runtime?.sendMessage !== 'function') {
    console.info(DEBUG_PREFIX, 'extension auth sync skipped: Chrome runtime bridge is unavailable');
    return;
  }

  await new Promise<void>((resolve) => {
    window.chrome?.runtime?.sendMessage?.(
      extensionId,
      message,
      (response?: unknown) => {
        const lastError = window.chrome?.runtime?.lastError;

        if (lastError?.message) {
          console.warn(DEBUG_PREFIX, 'extension auth sync failed', {
            extensionId,
            message: lastError.message,
          });
          resolve();
          return;
        }

        const extensionResponse = response as ExtensionMessageResponse | undefined;

        if (extensionResponse?.ok === false) {
          console.warn(DEBUG_PREFIX, 'extension auth sync was rejected by extension', {
            extensionId,
            response: extensionResponse,
          });
        }

        resolve();
      }
    );
  });
}
