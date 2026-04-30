// packages/extension/src/content/index.ts
import type { ExtensionMessage, PendingScrap } from '../types/index';
import { extractMetadataFromDocument } from './metadata';

const DEBUG_PREFIX = '[SAN:content]';
const isDebug = import.meta.env.DEV;

function debugLog(message: string, data?: unknown) {
  if (!isDebug) return;
  if (data === undefined) {
    console.debug(DEBUG_PREFIX, message);
    return;
  }
  console.debug(DEBUG_PREFIX, message, data);
}

debugLog('content script injected', { url: location.href });

function extractMetadata(): PendingScrap {
  return extractMetadataFromDocument(document, location, debugLog);
}

chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  debugLog('runtime message received', message);
  if (message.type === 'REQUEST_METADATA') {
    sendResponse(extractMetadata());
  }
});
