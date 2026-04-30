// packages/extension/src/content/index.ts
// 웹페이지에 주입되는 Content Script
// 역할 1: background의 REQUEST_METADATA 수신 → OG 태그 추출 → 응답
// 역할 2: 드래그 선택 텍스트 감지 → background로 전송

import type { ExtensionMessage, PendingScrap } from '../types/index';

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

// ──────────────────────────────────────────
// OG 태그 추출 유틸
// ──────────────────────────────────────────
function getMeta(property: string): string | null {
  return document.querySelector<HTMLMetaElement>(
    `meta[property='${property}'], meta[name='${property}']`
  )?.content ?? null;
}

// 메타데이터 추출 시 기본적으로 'LINK' 타입을 상정합니다.
function extractMetadata(): PendingScrap {
  const url = location.href;
  const domain = new URL(url).hostname;

  const metadata: PendingScrap = {
    source_type: 'LINK', // 기본값
    source_url: url,     // 규격 일치
    raw_content: getMeta('og:description') ?? getMeta('description'), // 규격 일치
    image_url: getMeta('og:image'), // 규격 일치
    title: getMeta('og:title') ?? document.title,
    domain,
    favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
  };

  debugLog('metadata extracted', metadata);
  return metadata;
}

// ──────────────────────────────────────────
// 메시지 리스너
// ──────────────────────────────────────────
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  debugLog('runtime message received', message);
  if (message.type === 'REQUEST_METADATA') {
    sendResponse(extractMetadata());
  }
});

// ──────────────────────────────────────────
// 드래그 선택 텍스트 감지
// mouseup 시점에 선택된 텍스트가 있으면 background로 전송
// ──────────────────────────────────────────
document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection()?.toString().trim();
  if (!selectedText || selectedText.length < 10) return;
  debugLog('selection detected', { length: selectedText.length });

  const metadata = extractMetadata();
  
  // 드래그 선택 시에는 타입을 'TEXT'로 변경하고 내용을 raw_content에 넣습니다.
  const message: ExtensionMessage = {
    type: 'SCRAP_SELECTION',
    payload: { 
      ...metadata, 
      source_type: 'TEXT', 
      raw_content: selectedText 
    },
  };

  chrome.runtime.sendMessage(message).catch((error) => {
    console.error(DEBUG_PREFIX, 'failed to send selected text to background', error);
  });
});
