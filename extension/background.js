console.log('background');

// Actions
const TAKE_SCREEN_RECORDING = 'TAKE_SCREEN_RECORDING';
const TAKE_SCREENSHOT = 'TAKE_SCREENSHOT';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case TAKE_SCREENSHOT:
      chrome.tabs.sendMessage(
        sender.tab.id,
        { request, sender },
        (response) => {
          sendResponse(response);
        }
      );
      break;
    case TAKE_SCREEN_RECORDING:
      chrome.desktopCapture.chooseDesktopMedia(['tab'], sender.tab, (streamId) => {
        if (!streamId) {
          sendResponse({
            type: 'error',
            message: 'Failed to get stream ID',
          });
          return;
        }

        sendResponse({
          type: 'success',
          streamId: streamId,
        });
      });
      break;
    default:
      break;
  }

  return true;
});
