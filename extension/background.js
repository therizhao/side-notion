/* eslint-disable no-console */
/* eslint-disable no-undef */
importScripts('constants.js');
importScripts('utils.js');

const screenCapture = (windowID) => new Promise((resolve, reject) => {
  chrome.tabs.captureVisibleTab(
    windowID,
    { format: 'png' },
    chromeCallbackHandler(resolve, reject),
  );
});

const sendTabsMessage = (tabID, request) => new Promise((resolve, reject) => {
  chrome.tabs.sendMessage(
    tabID,
    request,
    chromeCallbackHandler(resolve, reject),
  );
});

const getActiveTab = async (activeWindowID) => {
  const tabs = await chrome.tabs.query({
    windowId: activeWindowID,
    active: true,
  });
  return tabs[0];
};

const getActiveTabVideoPositionData = async (activeWindowID) => {
  console.log('take ss data');
  const tab = await getActiveTab(activeWindowID);

  return sendTabsMessage(tab.id, {
    action: GET_VIDEO_POSITION_DATA,
  });
};

const messageHandler = async (request, sender, sendResponse) => {
  try {
    switch (request.action) {
      case TAKE_SCREEN_SHOT: {
        console.log('fired ss');
        const [screenShotDataURI, videoPositionData] = await Promise.all([
          screenCapture(request.activeWindowID),
          getActiveTabVideoPositionData(request.activeWindowID),
        ]);
        sendResponse({ dataURI: screenShotDataURI, videoPositionData });
        break;
      }
      case GET_SCREEN_WIDTH: {
        const data = await sendTabsMessage(request.tabID, {
          action: request.action,
        });
        sendResponse({ screenWidth: data.screenWidth });
        break;
      }
      case SHOW_CAPTURE_AREA: {
        const activeTab = await getActiveTab(request.activeWindowID);
        const response = await sendTabsMessage(activeTab.id, {
          action: request.action,
        });
        sendResponse(response);
        break;
      }
      case SHOW_CAPTURE_AREA_IF_NO_VIDEO: {
        await sendTabsMessage(request.tabID, {
          action: request.action,
        });
        sendResponse({ success: true });
        break;
      }
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
