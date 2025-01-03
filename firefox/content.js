console.log("Content script is active!")

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'log') {
    console.log('Background log:', message.data);
  }
});