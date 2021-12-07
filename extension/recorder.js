const getVideoPosition = () => {
  const videoElement = getVideoElement();
  if (hasCaptureArea()) {
    const captureArea = getCaptureArea();
    const captureAreaRect = captureArea.getBoundingClientRect();
    captureAreaRect.width -= 10;
    captureAreaRect.height -= 10;
    captureAreaRect.x += 5;
    captureAreaRect.y += 5;
    return captureAreaRect;
  }

  return videoElement.getBoundingClientRect();
};

const hasCaptureArea = () => {
  const captureArea = getCaptureArea();
  return captureArea.style.display === 'block';
};

const getCaptureArea = () => {
  return document.getElementById(CAPTURE_AREA_ID);
};

const showCaptureArea = () => {
  const captureArea = getCaptureArea();
  captureArea.style.display = 'block';
  const videoElement = getVideoElement();
  if (videoElement) {
    const videoPosition = videoElement.getBoundingClientRect();
    captureArea.style.left = `${videoPosition.left}px`;
    captureArea.style.top = `${videoPosition.top}px`;
    captureArea.style.width = `${videoPosition.width}px`;
    captureArea.style.height = `${videoPosition.height}px`;
  } else {
    captureArea.style.left = '200px';
    captureArea.style.top = '200px';
    captureArea.style.width = '600px';
    captureArea.style.height = '400px';
  }
};

const drawCaptureArea = () => {
  const captureArea = document.createElement('div');
  captureArea.id = CAPTURE_AREA_ID;
  captureArea.style.cssText = `
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

  getBodyElement().appendChild(captureArea);

  interact(`#${CAPTURE_AREA_ID}`).resizable({
    edges: { top: true, left: true, bottom: true, right: true },
    listeners: {
      move: function (event) {
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
};

const handleMessage = async (message, sendResponse) => {
  try {
    switch (message.action) {
      case GET_VIDEO_POSITION_DATA:
        sendResponse(getVideoPosition());
        break;
      case SHOW_CAPTURE_AREA:
        showCaptureArea();
        sendResponse({ success: true });
        break;
      case GET_SCREEN_WIDTH:
        sendResponse({ screenWidth: window.screen.availWidth });
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(err.message);
    sendAlert(NOTION_ERR_MESSAGE);
    chrome.storage.local.clear();
  }
};

const recorder = () => {
  drawCaptureArea();
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sendResponse);
    return true;
  });

  console.log('RECORDER LOADED');
};

recorder();
