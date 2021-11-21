console.log('background');

const getExtensionIdFromTab = (tab) => {
  return JSON.parse(tab.extData).ext_id;
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  chrome.tabs.sendMessage(sender.tab.id, { request, sender }, (response) => {
    sendResponse(response);
  });

  return true;
});
