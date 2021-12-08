/* eslint-disable no-console */
/* eslint-disable no-undef */

/**
 * Singleton class
 */
class CaptureArea {
  constructor(captureAreaElement) {
    /**
     * @type {HTMLDivElement} captureAreaElement
     * @type {boolean} isEnabled
     * @type {boolean} isHidden
     *
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
    z-index: 100000000;
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

  enable() {
    this.captureAreaElement.style.display = 'block';
    const videoElement = getVideoElement();
    if (videoElement) {
      const videoPosition = videoElement.getBoundingClientRect();
      this.captureAreaElement.style.left = `${videoPosition.left}px`;
      this.captureAreaElement.style.top = `${videoPosition.top}px`;
      this.captureAreaElement.style.width = `${videoPosition.width}px`;
      this.captureAreaElement.style.height = `${videoPosition.height}px`;
    } else {
      this.captureAreaElement.style.left = '200px';
      this.captureAreaElement.style.top = '200px';
      this.captureAreaElement.style.width = '600px';
      this.captureAreaElement.style.height = '400px';
    }

    this.isEnabled = true;
  }

  getBoundingClientRect() {
    const captureAreaRect = this.captureAreaElement.getBoundingClientRect();
    captureAreaRect.width -= 10;
    captureAreaRect.height -= 10;
    captureAreaRect.x += 5;
    captureAreaRect.y += 5;
    return captureAreaRect;
  }
}

const captureArea = CaptureArea.init();

const getVideoPosition = () => {
  if (captureArea.isEnabled) {
    return captureArea.getBoundingClientRect();
  }

  const videoElement = getVideoElement();
  return videoElement.getBoundingClientRect();
};

const showCaptureAreaIfNoVideo = () => {
  if (!getVideoElement()) {
    captureArea.enable();
  }
};

const handleMessage = async (message, sendResponse) => {
  try {
    switch (message.action) {
      case GET_VIDEO_POSITION_DATA:
        console.log('fired ss');
        sendResponse(getVideoPosition());
        break;
      case SHOW_CAPTURE_AREA:
        captureArea.enable();
        sendResponse({ success: true });
        break;
      case GET_SCREEN_WIDTH:
        sendResponse({ screenWidth: window.screen.availWidth });
        break;
      case SHOW_CAPTURE_AREA_IF_NO_VIDEO:
        showCaptureAreaIfNoVideo();
        sendResponse({ success: true });
        break;
      default:
        break;
    }
  } catch (err) {
    sendAlert(NOTION_ERR_MESSAGE);
    chrome.storage.local.clear();
    throw err;
  }
};

const recorder = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sendResponse);
    return true;
  });

  console.log('RECORDER LOADED');
};

recorder();
