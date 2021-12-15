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

  toggle() {
    if (this.isEnabled) {
      this.toggleShowHide();
    } else {
      this.enable();
    }
  }

  toggleShowHide() {
    if (this.isHidden) {
      this.show();
    } else {
      this.hide();
    }
  }

  enable() {
    this.captureAreaElement.style.display = 'block';
    this.captureAreaElement.style.zIndex = '100000000';
    const videoElement = getVideoElement();
    if (videoElement) {
      const videoPosition = videoElement.getBoundingClientRect();
      this.captureAreaElement.style.left = `${videoPosition.left}px`;
      this.captureAreaElement.style.top = `${videoPosition.top}px`;
      this.captureAreaElement.style.width = `${videoPosition.width}px`;
      this.captureAreaElement.style.height = `${videoPosition.height}px`;
    } else {
      this.captureAreaElement.style.left = '100px';
      this.captureAreaElement.style.top = '100px';
      this.captureAreaElement.style.width = '300px';
      this.captureAreaElement.style.height = '200px';
    }

    this.isEnabled = true;
  }

  show() {
    this.captureAreaElement.style.visibility = 'visible';
    this.captureAreaElement.style.zIndex = '100000000';
    this.isHidden = false;
  }

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

/**
 *
 * @param {DOMRect} boundingRect
 */
const boundingRectToDimensions = (boundingRect) => {
  return {
    x: Math.ceil(boundingRect.x * window.devicePixelRatio),
    y: Math.ceil(boundingRect.y * window.devicePixelRatio),
    width: Math.ceil(boundingRect.width * window.devicePixelRatio),
    height: Math.ceil(boundingRect.height * window.devicePixelRatio),
  };
};

const captureArea = CaptureArea.init();

const getVideoPosition = () => {
  if (captureArea.isEnabled) {
    return captureArea.getDimensions();
  }

  const videoElement = getVideoElement();
  return boundingRectToDimensions(videoElement.getBoundingClientRect());
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
        sendResponse(getVideoPosition());
        break;
      case TOGGLE_CAPTURE_AREA:
        captureArea.toggle();
        sendResponse({ success: true });
        break;
      case GET_SCREEN_DIMENSIONS:
        sendResponse({ screenWidth: window.screen.availWidth, screenHeight: window.screen.availHeight });
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
};

recorder();
