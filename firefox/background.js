function logToActiveTab(message) {
  console.log(message);
  // アクティブなタブを取得
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const activeTabId = tabs[0].id;
      chrome.tabs.sendMessage(activeTabId, { type: 'log', data: message });
    } else {
      console.warn('No active tab found');
    }
  });
}

function sendURL(src) {
  fetch("http://localhost:8000/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(src)
  })
  .then(response => response.json())
  .then(data => { 
    console.log({ success: true, data })
  })
  .catch(error => {
    console.log({ success: false, error: error.message })
  });
}

// add ContextMenu
chrome.runtime.onInstalled.addListener(() => {
  // contexts : "all", "page", "selection", "image", "link" etc...
  chrome.contextMenus.create({
    id: "getPageUrl",
    title: "Get Page Url",
    contexts: ["page"]
  });
  chrome.contextMenus.create({
    id: "getLinkUrl",
    title: "Get Link Url",
    contexts: ["link"]
  });  
});

// add Click ContextMenu Event 
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'getPageUrl':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          const dst = { "kind" : "page", "url" : tabs[0].url };
          console.log("cilcked getPageUrl", dst);
          sendURL(dst);
        } else {
          console.log("cilcked getPageUrl", undefined);
        }
      });
      break;
    case 'getLinkUrl':
      const dst = { "kind" : "link", "url" : info.linkUrl };
      console.log("cilcked getLinkUrl", dst);
      sendURL(dst);
      break;
    default:
      console.log(`Sorry, we are out of ${expr}.`);
      break;
  }
});