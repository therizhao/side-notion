console.log('background');

const getExtensionIdFromTab = (tab) => {
  return JSON.parse(tab.extData).ext_id;
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    console.log(tabs);
    // NOTE: Make sure send to right place, for security reasons
    const videoTab = tabs.find(
      (tab) =>
        // Different frame id
        tab.id !== sender.tab.id &&
        // temp code
        tab.url === 'https://www.youtube.com/watch?v=A03oI0znAoc'
    );

    console.log(videoTab);
    chrome.tabs.sendMessage(videoTab.id, {}, (response) => {
      sendResponse(response);
    });
  });

  return true;
});
