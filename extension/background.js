importScripts('constants.js');
importScripts('utils.js');

const screenCapture = (windowID) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(
      windowID,
      { format: 'png' },
      chromeCallbackHandler(resolve, reject)
    );
  });
};

const getTab = (tabID) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.get(tabID, chromeCallbackHandler(resolve, reject));
  });
};

const sendMessage = (tabID, request) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(
      tabID,
      request,
      chromeCallbackHandler(resolve, reject)
    );
  });
};

const messageHandler = async (request, sender, sendResponse) => {
  try {
    console.log(request.tabID);
    switch (request.action) {
      case TAKE_CANVAS_SHOT:
        const canvasShotDataURI = await sendMessage(request.tabID, {
          action: request.action,
        });
        sendResponse(dataURI);
        break;
      case TAKE_SCREEN_SHOT:
        const tab = await getTab(request.tabID);
        const screenShotDataURI = await screenCapture(tab.windowId);
        sendResponse(screenShotDataURI);
        break;
      case GET_CURRENT_TAB_ID:
        sendResponse({ tabID: sender.tab.id });
        break;
      default:
        break;
    }
  } catch (err) {
    errorLog(messageHandler.name, err);
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  messageHandler(request, sender, sendResponse);
  return true;
});
