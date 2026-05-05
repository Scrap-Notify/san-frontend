// packages/extension/src/background/index.ts
import type { ExtensionMessage, PendingScrap } from '../types/index';

const DEBUG_PREFIX = '[SAN:background]';
const PENDING_STORAGE_KEY = 'san:pending-scrap';
const ACCESS_TOKEN_KEY = 'san_access_token';
const REFRESH_TOKEN_KEY = 'san_refresh_token';
const AUTH_SYNC_MESSAGE = 'SAN_AUTH_SYNC';
const isDebug = import.meta.env.DEV;

interface AuthSyncMessage {
  type: typeof AUTH_SYNC_MESSAGE;
  accessToken?: string;
  refreshToken?: string;
}

function isAuthSyncMessage(message: unknown): message is AuthSyncMessage {
  if (!message || typeof message !== 'object') return false;
  const maybe = message as Partial<AuthSyncMessage>;
  return maybe.type === AUTH_SYNC_MESSAGE;
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

chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender) => {
  debugLog('runtime message received', { message, tabId: sender.tab?.id, url: sender.tab?.url });
  if (message.type === 'SCRAP_SELECTION' && sender.tab?.id && message.payload) {
    pushToSidePanel(message.payload);
  }
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  debugLog('external message received', { message, origin: sender.origin, url: sender.url });

  if (!isAuthSyncMessage(message)) {
    return;
  }

  if (!message.accessToken || !message.refreshToken) {
    sendResponse({ ok: false });
    return;
  }

  chrome.storage.local
    .set({
      [ACCESS_TOKEN_KEY]: message.accessToken,
      [REFRESH_TOKEN_KEY]: message.refreshToken,
    })
    .then(() => {
      debugLog('auth tokens synced from dashboard');
      sendResponse({ ok: true });
    })
    .catch((error) => {
      console.error(DEBUG_PREFIX, 'failed to sync auth tokens', error);
      sendResponse({ ok: false });
    });

  return true;
});

function pushToSidePanel(payload: PendingScrap) {
  debugLog('push to side panel', payload);
  chrome.storage.local.set({ [PENDING_STORAGE_KEY]: payload }).catch((error) => {
    console.error(DEBUG_PREFIX, 'failed to persist pending scrap', error);
  });
  chrome.runtime.sendMessage({ type: 'PUSH_TO_SIDEPANEL', payload }).catch((error) => {
    debugLog('side panel is not ready to receive messages yet', error);
  });
}
