chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'san-scrap',
    title: 'SAN에 스크랩',
    contexts: ['selection'],
  });
});

// 익스텐션 아이콘 클릭 시 사이드패널 열기
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id! });
});

// 컨텍스트 메뉴 클릭 → 사이드패널로 선택 텍스트 전달
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'san-scrap' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'SCRAP_SELECTION',
      payload: { text: info.selectionText, url: tab.url, title: tab.title },
    });
  }
});

// 단축키로 빠르게 스크랩하기 (예: Ctrl+Shift+S)
chrome.commands.onCommand.addListener((command) => {
  if (command === "quick-save") {
    // 현재 활성화된 탭의 정보를 사이드패널로 전송하는 로직
    console.log("Quick Save Triggered!");
  }
});