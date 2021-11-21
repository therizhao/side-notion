/**
 *
 * @returns {HTMLVideoElement}
 */
const getVideoElement = () => {
  return document.documentElement.querySelector('video');
};

/**
 *
 * @returns {string} video screenshot data uri
 */
const takeScreenshot = () => {
  const videoElement = getVideoElement();
  const { width, height } = videoElement.getBoundingClientRect();

  const canvasElement = document.createElement('canvas');
  canvasElement.width = width;
  canvasElement.height = height;
  const ctx = canvasElement.getContext('2d');

  ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

  const dataURI = canvasElement.toDataURL('image/jpeg');
  return dataURI;
};

const TAKE_SCREENSHOT = 'TAKE_SCREENSHOT';
const NOTION_URL = 'https://www.notion.so';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Only allow notion to send request to us
  if (message.sender.origin !== NOTION_URL) {
    return;
  }

  switch (message.request.action) {
    case TAKE_SCREENSHOT:
      sendResponse(takeScreenshot());
      break;
    default:
      break;
  }
});
