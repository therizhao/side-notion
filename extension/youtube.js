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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request, sender);
  const dataURI = takeScreenshot();
  sendResponse(dataURI);
  return true;
});
