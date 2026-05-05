import type { AuthTokens } from '@san/shared';

const AUTH_SYNC_MESSAGE = 'SAN_AUTH_SYNC';
const AUTH_CLEAR_MESSAGE = 'SAN_AUTH_CLEAR';

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

declare global {
  interface Window {
    chrome?: ChromeRuntimeBridge;
  }
}

export async function syncExtensionAuth(tokens: AuthTokens): Promise<void> {
  await sendExtensionMessage({
    type: AUTH_SYNC_MESSAGE,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
}

export async function clearExtensionAuth(): Promise<void> {
  await sendExtensionMessage({ type: AUTH_CLEAR_MESSAGE });
}

async function sendExtensionMessage(message: unknown): Promise<void> {
  const extensionId = import.meta.env.VITE_SAN_EXTENSION_ID;

  if (!extensionId || typeof window.chrome?.runtime?.sendMessage !== 'function') {
    return;
  }

  await new Promise<void>((resolve) => {
    window.chrome?.runtime?.sendMessage?.(
      extensionId,
      message,
      () => {
        resolve();
      }
    );
  });
}
