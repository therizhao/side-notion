console.log('background');

// Actions
const START_SCREEN_RECORDING = 'START_SCREEN_RECORDING';
const END_SCREEN_RECORDING = 'END_SCREEN_RECORDING';
const TAKE_SCREENSHOT = 'TAKE_SCREENSHOT';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('request', request);
  switch (request.action) {
    case TAKE_SCREENSHOT:
    case START_SCREEN_RECORDING:
    case END_SCREEN_RECORDING:
      console.log(request);
      chrome.tabs.sendMessage(
        sender.tab.id,
        { request, sender },
        (response) => {
          console.log('response', response)
          sendResponse(response);
        }
      );
      break;
    default:
      break;
  }

  return true;
});
