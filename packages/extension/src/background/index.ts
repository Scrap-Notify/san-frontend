// packages/extension/src/background/index.ts
// Service Worker — 익스텐션의 중앙 허브
// 역할 1: 익스텐션 아이콘 클릭 → 사이드패널 열기
// 역할 2: 컨텍스트 메뉴 등록 → 클릭 시 현재 탭 메타데이터 추출 → 사이드패널로 전달
// 역할 3: Content Script의 드래그 선택 텍스트 수신 → 사이드패널로 전달

import type { ExtensionMessage, PendingScrap } from '../types/index';

const DEBUG_PREFIX = '[SAN:background]';
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

// ──────────────────────────────────────────
// 설치 시 초기화
// ──────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  debugLog('onInstalled');

  chrome.contextMenus.create({
    id: 'san-scrap-page',
    title: 'SAN: 이 페이지 스크랩',
    contexts: ['page'],
  });

  chrome.contextMenus.create({
    id: 'san-scrap-selection',
    title: 'SAN: 선택한 텍스트 스크랩',
    contexts: ['selection'],
  });
});

// ──────────────────────────────────────────
// 아이콘 클릭 → 사이드패널 열기
// ──────────────────────────────────────────
chrome.action.onClicked.addListener((tab) => {
  debugLog('action clicked', { tabId: tab.id, url: tab.url });
  if (!tab.id) return;
  chrome.sidePanel.open({ tabId: tab.id });
});

// ──────────────────────────────────────────
// 컨텍스트 메뉴 클릭 처리
// ──────────────────────────────────────────
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
    metadata = await chrome.tabs.sendMessage<any, PendingScrap>(tab.id, { type: 'REQUEST_METADATA' });
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
      raw_content: info.selectionText 
    });
  }
});

// ──────────────────────────────────────────
// Content Script → Background 메시지 수신
// 드래그 선택 텍스트를 사이드패널로 중계
// ──────────────────────────────────────────
// Content Script로부터 온 메시지 중계
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender) => {
  debugLog('runtime message received', { message, tabId: sender.tab?.id, url: sender.tab?.url });
  if (message.type === 'SCRAP_SELECTION' && sender.tab?.id && message.payload) {
    pushToSidePanel(message.payload);
  }
});

// ──────────────────────────────────────────
// 사이드패널로 메시지 전송 헬퍼
// ──────────────────────────────────────────
function pushToSidePanel(payload: PendingScrap) {
  debugLog('push to side panel', payload);
  chrome.runtime.sendMessage({ type: 'PUSH_TO_SIDEPANEL', payload }).catch((error) => {
    debugLog('side panel is not ready to receive messages yet', error);
  });
}
