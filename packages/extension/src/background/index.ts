// packages/extension/src/background/index.ts
import type { ExtensionMessage, PendingScrap } from '../types/index';

const DEBUG_PREFIX = '[SAN:background]';
const PENDING_STORAGE_KEY = 'san:pending-scrap';
const isDebug = import.meta.env.DEV;

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

function pushToSidePanel(payload: PendingScrap) {
  debugLog('push to side panel', payload);
  chrome.storage.local.set({ [PENDING_STORAGE_KEY]: payload }).catch((error) => {
    console.error(DEBUG_PREFIX, 'failed to persist pending scrap', error);
  });
  chrome.runtime.sendMessage({ type: 'PUSH_TO_SIDEPANEL', payload }).catch((error) => {
    debugLog('side panel is not ready to receive messages yet', error);
  });
}
