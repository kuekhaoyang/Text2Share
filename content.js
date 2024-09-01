function shareSelectedText(selectedText) {
  chrome.runtime.sendMessage({
    action: "openPopup",
    text: selectedText,
    url: window.location.href,
    title: document.title
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "shareFromContextMenu") {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      shareSelectedText(selectedText);
    }
  }
});