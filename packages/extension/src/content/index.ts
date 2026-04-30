// packages/extension/src/content/index.ts
// 웹페이지에 주입되는 Content Script
// 역할 1: background의 REQUEST_METADATA 수신 → OG 태그 추출 → 응답
// 역할 2: 드래그 선택 텍스트 감지 → background로 전송

import type { ExtensionMessage, PendingScrap } from '../types';

// ──────────────────────────────────────────
// OG 태그 추출 유틸
// ──────────────────────────────────────────
function getMeta(property: string): string | null {
  return (
    document.querySelector<HTMLMetaElement>(
      `meta[property='${property}'], meta[name='${property}']`
    )?.content ?? null
  );
}

function extractMetadata(): PendingScrap {
  const url = location.href;
  let domain = '';

  try {
    domain = new URL(url).hostname;
  } catch {
    domain = url;
  }

  return {
    title:       getMeta('og:title')       ?? document.title,
    url,
    domain,
    description: getMeta('og:description') ?? getMeta('description'),
    image:       getMeta('og:image'),
    favicon:     `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
  };
}

// ──────────────────────────────────────────
// 메시지 리스너
// ──────────────────────────────────────────
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    if (message.type === 'REQUEST_METADATA') {
      sendResponse(extractMetadata());
    }
    // sendResponse를 비동기로 쓰지 않으므로 return 불필요
  }
);

// ──────────────────────────────────────────
// 드래그 선택 텍스트 감지
// mouseup 시점에 선택된 텍스트가 있으면 background로 전송
// ──────────────────────────────────────────
document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection()?.toString().trim();

  // 너무 짧은 선택(오클릭 등)은 무시
  if (!selectedText || selectedText.length < 10) return;

  const { title, url, domain } = extractMetadata();

  const message: ExtensionMessage = {
    type: 'SCRAP_SELECTION',
    payload: { title, url, domain, selectedText },
  };

  chrome.runtime.sendMessage(message);
});