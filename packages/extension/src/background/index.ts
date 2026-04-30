// src/background/index.ts

// 1. 아이콘 클릭 시 사이드패널이 열리도록 설정
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

console.log('SAN 서비스 워커가 정상적으로 로드되었습니다. 🍃');