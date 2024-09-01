chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openPopup") {
    const popupUrl = chrome.runtime.getURL(
      `popup.html?text=${encodeURIComponent(request.text)}&url=${encodeURIComponent(request.url)}&title=${encodeURIComponent(request.title)}` 
    );
    chrome.tabs.create({ url: popupUrl }, (tab) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (info.status === 'complete' && tabId === tab.id) {
          chrome.tabs.sendMessage(tabId, {action: "getImageHeight"}, (response) => {
            if (response && response.height) {
              chrome.tabs.update(tab.id, {height: response.height + 100});
            }
          });
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "text2share",
    title: "Text2Share",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "text2share") {
    chrome.tabs.sendMessage(tab.id, { action: "shareFromContextMenu" });
  }
});