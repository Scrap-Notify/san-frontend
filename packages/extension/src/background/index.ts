// packages/extension/src/background/index.ts
// Service Worker — 익스텐션의 중앙 허브
// 역할 1: 익스텐션 아이콘 클릭 → 사이드패널 열기
// 역할 2: 컨텍스트 메뉴 등록 → 클릭 시 현재 탭 메타데이터 추출 → 사이드패널로 전달
// 역할 3: Content Script의 드래그 선택 텍스트 수신 → 사이드패널로 전달

import type { ExtensionMessage, PendingScrap } from '../types';

// ──────────────────────────────────────────
// 설치 시 초기화
// ──────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
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
  if (!tab.id) return;
  chrome.sidePanel.open({ tabId: tab.id });
});

// ──────────────────────────────────────────
// 컨텍스트 메뉴 클릭 처리
// ──────────────────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  // 사이드패널이 닫혀있을 수 있으니 먼저 열기
  await chrome.sidePanel.open({ tabId: tab.id });

  if (info.menuItemId === 'san-scrap-page') {
    // Content Script에 메타데이터 요청
    const metadata = await chrome.tabs.sendMessage<ExtensionMessage, PendingScrap>(
      tab.id,
      { type: 'REQUEST_METADATA' }
    );
    // 사이드패널로 전달
    pushToSidePanel(tab.id, metadata);
  }

  if (info.menuItemId === 'san-scrap-selection' && info.selectionText) {
    // 선택 텍스트는 Content Script가 이미 보냈으므로
    // 여기선 page 메타데이터만 추가로 보강
    const metadata = await chrome.tabs.sendMessage<ExtensionMessage, PendingScrap>(
      tab.id,
      { type: 'REQUEST_METADATA' }
    );
    pushToSidePanel(tab.id, {
      ...metadata,
      description: info.selectionText, // 선택 텍스트를 description으로 활용
    });
  }
});

// ──────────────────────────────────────────
// Content Script → Background 메시지 수신
// 드래그 선택 텍스트를 사이드패널로 중계
// ──────────────────────────────────────────
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender) => {
    if (message.type === 'SCRAP_SELECTION' && sender.tab?.id) {
      const { title, url, domain, selectedText } = message.payload;

      pushToSidePanel(sender.tab.id, {
        title,
        url,
        domain,
        description: selectedText,
        image: null,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      });
    }
  }
);

// ──────────────────────────────────────────
// 사이드패널로 메시지 전송 헬퍼
// ──────────────────────────────────────────
function pushToSidePanel(tabId: number, payload: PendingScrap) {
  const message: ExtensionMessage = {
    type: 'PUSH_TO_SIDEPANEL',
    payload,
  };
  // 사이드패널은 extension context에서 동작하므로 runtime.sendMessage 사용
  chrome.runtime.sendMessage(message).catch(() => {
    // 사이드패널이 아직 열리지 않은 경우 무시
  });
}