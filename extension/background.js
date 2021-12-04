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

const getScreenShotDataURI = async (tabID) => {
  const tab = await getTab(tabID);
  const screenShotDataURI = await screenCapture(tab.windowId);
  return screenShotDataURI;
};

const messageHandler = async (request, sender, sendResponse) => {
  try {
    switch (request.action) {
      case TAKE_CANVAS_SHOT:
        const canvasShotDataURI = await sendMessage(request.tabID, {
          action: request.action,
        });
        sendResponse({ dataURI: canvasShotDataURI });
        break;
      case TAKE_SCREEN_SHOT:
        const [screenShotDataURI, videoPositionData] = await Promise.all([
          getScreenShotDataURI(request.tabID),
          sendMessage(request.tabID, {
            action: GET_VIDEO_POSITION_DATA,
          }),
        ]);
        sendResponse({ dataURI: screenShotDataURI, videoPositionData });
        break;
      case GET_SCREEN_WIDTH:
        const data = await sendMessage(request.tabID, {
          action: request.action,
        });
        sendResponse({ screenWidth: data.screenWidth });
        break;
      case SHOW_BADGE_ACTIVE:
        await chrome.action.setBadgeText({ text: 'S' });
        sendResponse({ success: true });
        break;
      case SHOW_BADGE_INACTIVE:
        await chrome.action.setBadgeText({ text: '' });
        sendResponse({ success: true });
        break;
      case GET_CURRENT_TAB_ID:
        sendResponse({ tabID: sender.tab.id });
        break;
      case SHOW_ACTIVE_VIDEO:
        const response = await sendMessage(request.tabID, {
          action: request.action,
        });
        sendResponse(response);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(err.message);
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  messageHandler(request, sender, sendResponse);
  return true;
});

// const activatedHandler = async (tabId) => {
//   try {
//     const { hasVideo } = await sendMessage(tabId, {
//       action: QUERY_HAS_VIDEO,
//     });

//     if (hasVideo) {
//       await chrome.action.setBadgeText({ text: 'S' });
//     } else {
//       await chrome.action.setBadgeText({ text: '' });
//     }
//   } catch (err) {
//     await chrome.action.setBadgeText({ text: '' });
//     console.error(err.message);
//   }
// };

// chrome.tabs.onActivated.addListener((activatedInfo) => {
//   activatedHandler(activatedInfo.tabId);
// });

// chrome.tabs.onCreated.addListener((tab) => {
//   activatedHandler(tab.id);
// });
