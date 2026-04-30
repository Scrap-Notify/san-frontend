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

document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection()?.toString().trim();
  if (!selectedText || selectedText.length < 10) return;
  debugLog('selection detected', { length: selectedText.length });

  const metadata = extractMetadata();
  const message: ExtensionMessage = {
    type: 'SCRAP_SELECTION',
    payload: {
      ...metadata,
      source_type: 'TEXT',
      raw_content: selectedText,
    },
  };

  chrome.runtime.sendMessage(message).catch((error) => {
    console.error(DEBUG_PREFIX, 'failed to send selected text to background', error);
  });
});
