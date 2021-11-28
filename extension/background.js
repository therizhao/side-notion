console.log('background');

// Actions
const LOAD_VIDEO_IFRAME = 'LOAD_VIDEO_IFRAME';
const START_SCREEN_RECORDING = 'START_SCREEN_RECORDING';
const END_SCREEN_RECORDING = 'END_SCREEN_RECORDING';
const TAKE_SCREENSHOT = 'TAKE_SCREENSHOT';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case LOAD_VIDEO_IFRAME:
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log(tabs);
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
          request,
          sender,
        });
      });
      break;
    case TAKE_SCREENSHOT:
    case START_SCREEN_RECORDING:
    case END_SCREEN_RECORDING:
      chrome.tabs.sendMessage(
        sender.tab.id,
        { request, sender },
        (response) => {
          console.log('response', response);
          sendResponse(response);
        }
      );
      break;
    default:
      break;
  }

  return true;
});
