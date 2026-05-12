// packages/extension/src/background/index.ts
import type { ExtensionMessage, PendingScrap } from '@extension/types/index';

const DEBUG_PREFIX = '[SAN:background]';
const defaultBaseURL = import.meta.env.PROD
  ? 'https://k14a309.p.ssafy.io/api'
  : 'http://localhost:8080/api';
const baseURL = normalizeApiBaseURL(import.meta.env.VITE_API_BASE_URL ?? defaultBaseURL);
const PENDING_STORAGE_KEY = 'san:pending-scrap';
const ACCESS_TOKEN_KEY = 'san_access_token';
const REFRESH_TOKEN_KEY = 'san_refresh_token';
const SESSION_ID_KEY = 'san_session_id';
const CLIENT_TYPE_KEY = 'san_client_type';
const AUTH_SYNC_MESSAGE = 'SAN_AUTH_SYNC';
const AUTH_CLEAR_MESSAGE = 'SAN_AUTH_CLEAR';
const AUTH_STATE_CHANGED_MESSAGE = 'SAN_AUTH_STATE_CHANGED';
const LOGIN_BRIDGE_TICKET_MESSAGE = 'LOGIN_BRIDGE_TICKET';
const isDebug = import.meta.env.DEV;

function normalizeApiBaseURL(value: string) {
  const trimmed = value.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

interface AuthSyncMessage {
  type: typeof AUTH_SYNC_MESSAGE;
  accessToken?: string;
  refreshToken?: string;
  sessionId?: string;
  clientType?: 'DASHBOARD' | 'EXTENSION';
}

interface AuthClearMessage {
  type: typeof AUTH_CLEAR_MESSAGE;
}

interface LoginBridgeTicketMessage {
  type: typeof LOGIN_BRIDGE_TICKET_MESSAGE;
  ticket?: string;
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

function isAuthSyncMessage(message: unknown): message is AuthSyncMessage {
  if (!message || typeof message !== 'object') return false;
  const maybe = message as Partial<AuthSyncMessage>;
  return maybe.type === AUTH_SYNC_MESSAGE;
}

function isAuthClearMessage(message: unknown): message is AuthClearMessage {
  if (!message || typeof message !== 'object') return false;
  const maybe = message as Partial<AuthClearMessage>;
  return maybe.type === AUTH_CLEAR_MESSAGE;
}

function isLoginBridgeTicketMessage(message: unknown): message is LoginBridgeTicketMessage {
  if (!message || typeof message !== 'object') return false;
  const maybe = message as Partial<LoginBridgeTicketMessage>;
  return maybe.type === LOGIN_BRIDGE_TICKET_MESSAGE;
}

function debugLog(message: string, data?: unknown) {
  if (!isDebug) return;
  if (data === undefined) {
    console.debug(DEBUG_PREFIX, message);
    return;
  }
  console.debug(DEBUG_PREFIX, message, data);
}

debugLog('service worker loaded');

chrome.runtime.onInstalled.addListener(() => {
  debugLog('onInstalled');

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'san-scrap-page',
      title: 'SAN: Save this page',
      contexts: ['page'],
    });

    chrome.contextMenus.create({
      id: 'san-scrap-selection',
      title: 'SAN: Save selected text',
      contexts: ['selection'],
    });
  });
});

chrome.action.onClicked.addListener((tab) => {
  debugLog('action clicked', { tabId: tab.id, url: tab.url });
  if (!tab.id) return;
  chrome.sidePanel.open({ tabId: tab.id });
});

chrome.commands.onCommand.addListener(async (command) => {
  debugLog('command received', command);

  if (command === 'capture_image') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    try {
      try {
        await chrome.sidePanel.open({ tabId: tab.id });
      } catch (error) {
        console.error(DEBUG_PREFIX, 'failed to open side panel before capture_image', {
          error,
          tabId: tab.id,
          url: tab.url,
        });
        throw error;
      }

      let dataUrl: string;
      try {
        dataUrl = await chrome.tabs.captureVisibleTab();
      } catch (error) {
        console.error(DEBUG_PREFIX, 'failed to capture visible tab for capture_image', {
          error,
          tabId: tab.id,
          url: tab.url,
        });
        throw error;
      }

      let metadata: PendingScrap;
      try {
        metadata = await chrome.tabs.sendMessage<ExtensionMessage, PendingScrap>(tab.id, { type: 'REQUEST_METADATA' });
      } catch (error) {
        metadata = {
          source_type: 'IMAGE',
          source_url: tab.url ?? null,
          raw_content: tab.title ?? 'Captured image',
          image_url: null,
          title: tab.title ?? 'Captured image',
          domain: tab.url ? new URL(tab.url).hostname : '',
          favicon: tab.favIconUrl ?? null,
        };
      }

      pushToSidePanel({
        ...metadata,
        source_type: 'IMAGE',
        image_preview_url: dataUrl,
        raw_content: tab.title ?? 'Captured image',
      });
    } catch (error) {
      console.error(DEBUG_PREFIX, 'failed to capture image or open side panel', error);
    }
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  debugLog('context menu clicked', { menuItemId: info.menuItemId, tabId: tab?.id, url: tab?.url });
  if (!tab?.id) return;

  try {
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (error) {
    console.error(DEBUG_PREFIX, 'failed to open side panel', error);
    return;
  }

  let metadata: PendingScrap;
  try {
    metadata = await chrome.tabs.sendMessage<ExtensionMessage, PendingScrap>(tab.id, { type: 'REQUEST_METADATA' });
    debugLog('received metadata from content script', metadata);
  } catch (error) {
    console.error(
      DEBUG_PREFIX,
      'failed to request metadata. Check that the content script is injected into this page.',
      error,
    );
    return;
  }

  if (info.menuItemId === 'san-scrap-page') {
    pushToSidePanel(metadata);
  } else if (info.menuItemId === 'san-scrap-selection' && info.selectionText) {
    pushToSidePanel({
      ...metadata,
      source_type: 'TEXT',
      raw_content: info.selectionText,
    });
  }
});

chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  debugLog('runtime message received', { message, tabId: sender.tab?.id, url: sender.tab?.url });
  if (message.type === 'SCRAP_SELECTION' && sender.tab?.id && message.payload) {
    pushToSidePanel(message.payload);
    return;
  }

  if (isAuthClearMessage(message)) {
    clearAuthTokens()
      .then(() => {
        debugLog('auth tokens cleared');
        sendResponse({ ok: true, hasAccessToken: false, hasRefreshToken: false });
      })
      .catch((error) => {
        console.error(DEBUG_PREFIX, 'failed to clear auth tokens', error);
        sendResponse({ ok: false });
      });
    return true;
  }

  if (isAuthSyncMessage(message)) {
    syncAuthTokens(message)
      .then((authState) => {
        debugLog('auth tokens synced');
        sendResponse({ ok: true, ...authState });
      })
      .catch((error) => {
        console.error(DEBUG_PREFIX, 'failed to sync auth tokens', error);
        sendResponse({ ok: false });
      });
    return true;
  }

  if (isLoginBridgeTicketMessage(message)) {
    exchangeAndSyncBridgeToken(message)
      .then((authState) => {
        debugLog('bridge ticket exchanged');
        sendResponse({ ok: true, ...authState });
      })
      .catch((error) => {
        console.error(DEBUG_PREFIX, 'failed to exchange bridge ticket', error);
        sendResponse({ ok: false });
      });
    return true;
  }
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  debugLog('external message received', { message, origin: sender.origin, url: sender.url });

  if (!isAuthSyncMessage(message)) {
    if (isLoginBridgeTicketMessage(message)) {
      exchangeAndSyncBridgeToken(message)
        .then((authState) => {
          debugLog('bridge ticket exchanged from dashboard');
          sendResponse({ ok: true, ...authState });
        })
        .catch((error) => {
          console.error(DEBUG_PREFIX, 'failed to exchange bridge ticket', error);
          sendResponse({ ok: false });
        });

      return true;
    }

    if (!isAuthClearMessage(message)) {
      return;
    }

    clearAuthTokens()
      .then(() => {
        debugLog('auth tokens cleared from dashboard');
        sendResponse({ ok: true, hasAccessToken: false, hasRefreshToken: false });
      })
      .catch((error) => {
        console.error(DEBUG_PREFIX, 'failed to clear auth tokens', error);
        sendResponse({ ok: false });
      });

    return true;
  }

  if (!message.accessToken || !message.refreshToken) {
    sendResponse({ ok: false });
    return;
  }

  syncAuthTokens(message)
    .then((authState) => {
      debugLog('auth tokens synced from dashboard');
      sendResponse({ ok: true, ...authState });
    })
    .catch((error) => {
      console.error(DEBUG_PREFIX, 'failed to sync auth tokens', error);
      sendResponse({ ok: false });
    });

  return true;
});

async function exchangeAndSyncBridgeToken(message: LoginBridgeTicketMessage) {
  if (!message.ticket) {
    throw new Error('Missing bridge ticket');
  }

  const response = await fetch(`${baseURL}/auth/bridge/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticket: message.ticket }),
  });

  const payload = await response.json() as ApiResponse<TokenResponse>;

  if (!response.ok || !payload.ok || !payload.data) {
    throw new Error(payload.message ?? payload.error ?? 'Bridge token exchange failed');
  }

  return syncAuthTokens({
    type: AUTH_SYNC_MESSAGE,
    accessToken: payload.data.accessToken,
    refreshToken: payload.data.refreshToken,
    sessionId: payload.data.sessionId,
    clientType: 'EXTENSION',
  });
}

async function syncAuthTokens(message: AuthSyncMessage) {
  if (!message.accessToken || !message.refreshToken) {
    throw new Error('Missing auth tokens');
  }

  await chrome.storage.local.set({
    [ACCESS_TOKEN_KEY]: message.accessToken,
    [REFRESH_TOKEN_KEY]: message.refreshToken,
    [CLIENT_TYPE_KEY]: message.clientType ?? 'EXTENSION',
    ...(message.sessionId ? { [SESSION_ID_KEY]: message.sessionId } : {}),
  });
  notifyAuthStateChanged(true);

  return readStoredAuthState();
}

async function clearAuthTokens() {
  await chrome.storage.local.remove([
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    SESSION_ID_KEY,
    CLIENT_TYPE_KEY,
  ]);
  notifyAuthStateChanged(false);
}

async function readStoredAuthState() {
  const stored = await chrome.storage.local.get([
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    SESSION_ID_KEY,
    CLIENT_TYPE_KEY,
  ]);

  return {
    hasAccessToken: typeof stored[ACCESS_TOKEN_KEY] === 'string',
    hasRefreshToken: typeof stored[REFRESH_TOKEN_KEY] === 'string',
    hasSessionId: typeof stored[SESSION_ID_KEY] === 'string',
    clientType: typeof stored[CLIENT_TYPE_KEY] === 'string' ? stored[CLIENT_TYPE_KEY] : null,
  };
}

function notifyAuthStateChanged(isAuthenticated: boolean) {
  chrome.runtime
    .sendMessage({
      type: AUTH_STATE_CHANGED_MESSAGE,
      isAuthenticated,
    })
    .catch((error) => {
      debugLog('auth state change broadcast skipped', error);
    });
}

function pushToSidePanel(payload: PendingScrap) {
  debugLog('push to side panel', payload);
  chrome.storage.local.set({ [PENDING_STORAGE_KEY]: payload }).catch((error) => {
    console.error(DEBUG_PREFIX, 'failed to persist pending scrap', error);
  });
  chrome.runtime.sendMessage({ type: 'PUSH_TO_SIDEPANEL', payload }).catch((error) => {
    debugLog('side panel is not ready to receive messages yet', error);
  });
}
