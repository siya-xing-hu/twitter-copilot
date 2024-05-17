export async function addTabListener() {
  // 监听标签页更新事件
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
      sendMessageToContentScript(tabId, tab.url);
    }
  });

  // 监听标签页激活事件
  chrome.tabs.onActivated.addListener(({ tabId }) => {
    chrome.tabs.get(tabId, (tab) => {
      // 检测标签页加载完毕
      if (tab && tab.status === "complete") {
        sendMessageToContentScript(tabId, tab.url);
      }
    });
  });

  chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({ url: "*://*.twitter.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        if (typeof tab.id === "number") {
          chrome.tabs.sendMessage(tab.id, {
            type: "twitter-url",
          });
        }
      });
    });
    chrome.tabs.query({ url: "*://*.producthunt.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        if (typeof tab.id === "number") {
          chrome.tabs.sendMessage(tab.id, {
            type: "producthunt-url",
          });
        }
      });
    });
  });
}

// 发送消息给内容脚本
function sendMessageToContentScript(tabId: number, url: string | undefined) {
  if (!url) {
    return;
  }
  if (isTwitterUrl(url)) {
    chrome.tabs.sendMessage(tabId, { type: "twitter-url" });
  } else if (isProductHuntUrl(url)) {
    chrome.tabs.sendMessage(tabId, { type: "producthunt-url" });
  }
}

// 判断是否是 Twitter URL
function isTwitterUrl(url: string) {
  return url.startsWith("https://twitter.com/") ||
    url.startsWith("https://x.com/");
}

// 判断是否是 Product Hunt URL
function isProductHuntUrl(url: string) {
  return url.startsWith("https://www.producthunt.com/");
}
