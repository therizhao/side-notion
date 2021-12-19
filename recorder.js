/* eslint-disable no-console */
/* eslint-disable no-undef */

/**
 *
 * @param {DOMRect} boundingRect
 */
const boundingRectToDimensions = (boundingRect) => ({
  x: Math.ceil(boundingRect.x * window.devicePixelRatio),
  y: Math.ceil(boundingRect.y * window.devicePixelRatio),
  width: Math.ceil(boundingRect.width * window.devicePixelRatio),
  height: Math.ceil(boundingRect.height * window.devicePixelRatio),
});

/**
 * Singleton class
 */
class CaptureArea {
  constructor(captureAreaElement) {
    /**
     * @type {HTMLDivElement} captureAreaElement
     * @type {boolean} isEnabled
     * @type {boolean} isHidden
     */
    this.captureAreaElement = captureAreaElement;
    this.isEnabled = false;
    this.isHidden = false;
  }

  /**
   * Factory method should only be called once
   */
  static init() {
    const captureAreaElement = document.createElement('div');
    captureAreaElement.id = CAPTURE_AREA_ID;
    captureAreaElement.style.cssText = `
    display: none;
    position: absolute;
    box-sizing: border-box;
    width: 0px;
    height: 0px;
    left: 0px;
    top: 0px;
    border: 4px solid rgb(127 218 255);
    border-radius: 3px;
    padding: 20px;
    margin: 1rem;
    overflow: hidden;
    touch-action: none;  
  `;

    getBodyElement().appendChild(captureAreaElement);

    interact(`#${CAPTURE_AREA_ID}`).resizable({
      edges: {
        top: true,
        left: true,
        bottom: true,
        right: true,
      },
      listeners: {
        move(event) {
          let { x, y } = event.target.dataset;

          x = (parseFloat(x) || 0) + event.deltaRect.left;
          y = (parseFloat(y) || 0) + event.deltaRect.top;

          Object.assign(event.target.style, {
            width: `${event.rect.width}px`,
            height: `${event.rect.height}px`,
            transform: `translate(${x}px, ${y}px)`,
          });

          Object.assign(event.target.dataset, { x, y });
        },
      },
    });

    return new CaptureArea(captureAreaElement);
  }

  toggleShowHide() {
    if (this.isHidden) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * Capture area is hidden and disabled
   */
  disable() {
    this.hide();
    this.isEnabled = false;
  }

  /**
   * Capture area is enabled and shown
   */
  enable() {
    this.captureAreaElement.style.display = 'block';
    const videoElement = getVideoElement();
    if (videoElement) {
      const videoPosition = videoElement.getBoundingClientRect();
      this.captureAreaElement.style.left = `${videoPosition.left - 10}px`;
      this.captureAreaElement.style.top = `${videoPosition.top - 10}px`;
      this.captureAreaElement.style.width = `${videoPosition.width}px`;
      this.captureAreaElement.style.height = `${videoPosition.height}px`;
    } else {
      this.captureAreaElement.style.left = '100px';
      this.captureAreaElement.style.top = '100px';
      this.captureAreaElement.style.width = '300px';
      this.captureAreaElement.style.height = '200px';
    }

    this.isEnabled = true;
    this.show();
  }

  /**
   * Capture area is shown
   */
  show() {
    this.captureAreaElement.style.visibility = 'visible';
    this.captureAreaElement.style.zIndex = '100000000';
    this.isHidden = false;
  }

  /**
   * Capture area is hidden
   */
  hide() {
    this.captureAreaElement.style.visibility = 'hidden';
    this.captureAreaElement.style.zIndex = '-100000000';
    this.isHidden = true;
  }

  getDimensions() {
    const captureAreaRect = this.captureAreaElement.getBoundingClientRect();
    captureAreaRect.width -= 10;
    captureAreaRect.height -= 10;
    captureAreaRect.x += 5;
    captureAreaRect.y += 5;
    return boundingRectToDimensions(captureAreaRect);
  }
}

const captureArea = CaptureArea.init();

const getVideoPosition = () => {
  if (captureArea.isEnabled) {
    return captureArea.getDimensions();
  }

  const videoElement = getVideoElement();
  if (!videoElement) {
    captureArea.enable();
    return getVideoPosition();
  }

  return boundingRectToDimensions(videoElement.getBoundingClientRect());
};

const showCaptureAreaIfNoVideo = () => {
  if (!getVideoElement()) {
    captureArea.enable();
  }
};

/**
 *
 * Plays video if video is paused
 * Pause video if video is playing
 * Alerts if no video element
 */
const playPauseVideo = () => {
  const videoElement = getVideoElement();
  if (!videoElement) {
    sendAlert("There's no video to play or pause");
    return;
  }

  if (isVideoPlaying(videoElement)) {
    videoElement.pause();
    return;
  }

  videoElement.play();
};

/**
 *
 * Show video controls iff there's a video and controls not shown
 * Otherwise do nothing
 */
const showVideoControls = () => {
  if (isYoutube()) {
    showElementIfExist(document.querySelector('.ytp-gradient-bottom'));
    showElementIfExist(document.querySelector('.ytp-chrome-bottom'));
    showElementIfExist(
      document.querySelector(
        '#movie_player > div.ytp-player-content.ytp-iv-player-content',
      ),
    );
    return;
  }

  if (isZoom()) {
    showElementIfExist(document.querySelector('.vjs-control-bar'));
    // Don't want show getty notice (it's useless)
  }

  // If not above (add more later)
};

/**
 * Hide video controls iff they exist
 * Otherwise do nothing
 */
const hideVideoControls = () => {
  if (isYoutube()) {
    hideElementIfExist(document.querySelector('.ytp-gradient-bottom'));
    hideElementIfExist(document.querySelector('.ytp-chrome-bottom'));
    hideElementIfExist(
      document.querySelector(
        '#movie_player > div.ytp-player-content.ytp-iv-player-content',
      ),
    );
    return;
  }

  if (isZoom()) {
    hideElementIfExist(document.querySelector('.vjs-control-bar'));
    hideElementIfExist(document.querySelector('.getty-notice'));
  }

  // If not above (add more later)
};

const flashVideoControls = () => {
  showVideoControls();
  setTimeout(() => {
    hideVideoControls();
  }, 1000);
};

const skip5s = () => {
  const videoElement = getVideoElement();
  if (!videoElement) {
    sendAlert("There's no video to skip 5s");
    return;
  }

  flashVideoControls();
  if (isYoutube()) {
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        keyCode: 39,
        code: 'ArrowRight',
      }),
    );
  } else {
    videoElement.currentTime += 5;
  }
};

const back5s = () => {
  const videoElement = getVideoElement();
  if (!videoElement) {
    sendAlert("There's no video to back 5s");
    return;
  }

  flashVideoControls();

  if (isYoutube()) {
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        keyCode: 37,
        code: 'ArrowLeft',
      }),
    );
  } else {
    videoElement.currentTime -= 5;
  }
};

const handleMessage = async (message, sendResponse) => {
  try {
    switch (message.action) {
      case GET_VIDEO_POSITION_DATA:
        sendResponse(getVideoPosition());
        break;
      case DISABLE_CAPTURE_AREA: {
        captureArea.disable();
        sendResponse({ success: true });
        break;
      }
      case TOGGLE_SHOW_HIDE_CAPTURE_AREA:
        if (captureArea.isEnabled) {
          captureArea.toggleShowHide();
        } else {
          captureArea.enable();
        }
        sendResponse({ success: true });
        break;
      case GET_SCREEN_DIMENSIONS:
        sendResponse({
          screenWidth: window.screen.availWidth,
          screenHeight: window.screen.availHeight,
        });
        break;
      case SHOW_CAPTURE_AREA_IF_NO_VIDEO:
        showCaptureAreaIfNoVideo();
        sendResponse({ success: true });
        break;
      case PLAY_PAUSE_VIDEO: {
        playPauseVideo();
        sendResponse({ success: true });
        break;
      }
      case SKIP_5S: {
        skip5s();
        sendResponse({ success: true });
        break;
      }
      case BACK_5S: {
        back5s();
        sendResponse({ success: true });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    sendAlert(NOTION_ERR_MESSAGE);
    chrome.storage.local.clear();
    throw err;
  }
};

/**
 * Hide video controls when mouse not in video
 */
const manageVideoControls = () => {
  const videoElement = getVideoElement();
  if (!videoElement) {
    return;
  }

  hideVideoControls();
  document.addEventListener('mouseover', () => {
    showVideoControls();
  });
  document.addEventListener('mouseout', () => {
    hideVideoControls();
  });
};

const recorder = () => {
  manageVideoControls();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sendResponse);
    return true;
  });
};

recorder();
