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

const getCurrentTabID = async () => {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });

  if (tabs.length == 0) {
    throw new Error('No active tab');
  }

  return tabs[0].id;
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

const getActiveTab = async (activeWindowID) => {
  const tabs = await chrome.tabs.query({
    windowId: activeWindowID,
    active: true,
  });
  return tabs[0];
};

const getActiveTabVideoPositionData = async (activeWindowID) => {
  const tab = await getActiveTab(activeWindowID);

  return sendMessage(tab.id, {
    action: GET_VIDEO_POSITION_DATA,
  });
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
          screenCapture(request.activeWindowID),
          getActiveTabVideoPositionData(request.activeWindowID),
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
      case SHOW_CAPTURE_AREA:
        const activeTab = await getActiveTab(request.activeWindowID);
        const response = await sendMessage(activeTab.id, {
          action: request.action,
        });
        sendResponse(response);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(err.message);
    sendResponse({ success: false });
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  messageHandler(request, sender, sendResponse);
  return true;
});

chrome.runtime.setUninstallURL(FEEDBACK_URL);

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
