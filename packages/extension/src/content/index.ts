document.addEventListener('mouseup', () => {
  const selected = window.getSelection()?.toString().trim();
  if (selected && selected.length > 20) {
    chrome.runtime.sendMessage({
      type: 'TEXT_SELECTED',
      payload: { text: selected, url: location.href, title: document.title },
    });
  }
});