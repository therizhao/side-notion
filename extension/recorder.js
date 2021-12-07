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

/**
 *
 * @returns {string} video screenshot data uri
 */
const captureVideoIFrame = () => {
  const videoElement = getVideoElement();
  const { width, height } = videoElement.getBoundingClientRect();

  const canvasElement = document.createElement('canvas');
  canvasElement.width = width;
  canvasElement.height = height;
  const ctx = canvasElement.getContext('2d');

  ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

  const dataURI = canvasElement.toDataURL('image/png');
  return dataURI;
};

// class ScreenRecorder {
//   constructor() {
//     /**
//      * @type {boolean}
//      */
//     this.isStartRecording = false;
//     /**
//      * @type {HTMLCanvasElement}
//      */
//     this.canvasElement = null;

//     this.chunks = [];

//     this.mediaStream = null;
//   }

//   startRecording() {
//     this.isStartRecording = true;

//     // Start recording
//     const videoElement = getVideoElement();
//     const { width, height } = videoElement.getBoundingClientRect();

//     this.canvasElement = document.createElement('canvas');
//     this.canvasElement.width = width;
//     this.canvasElement.height = height;

//     const mediaStream = new MediaStream(this.canvasElement.captureStream(60)); // 60 fps
//     console.log('mediaStream', mediaStream);
//     this.recorder = new MediaRecorder(mediaStream, {
//       mimeType: 'video/webm; codecs=vp9',
//     });

//     this.recorder.start(16);
//     this.recorder.ondataavailable = (ev) => {
//       console.log('new chunk', ev);
//       this.chunks.push(ev.data);
//     };
//     this.recorder.onstop = () => {
//       console.log('STOPPED');
//     };

//     this.recordFrame(videoElement);
//   }

//   recordFrame(videoElement) {
//     if (!this.isStartRecording || !this.canvasElement) {
//       return;
//     }

//     setTimeout(() => {
//       const ctx = this.canvasElement.getContext('2d');
//       ctx.drawImage(
//         videoElement,
//         0,
//         0,
//         this.canvasElement.width,
//         this.canvasElement.height
//       );
//       this.recordFrame(videoElement);
//     }, 16); // Record at 60 fps
//   }

//   /**
//    *
//    * @returns {Blob} screen recording blob
//    */
//   endRecording() {
//     if (this.chunks.length <= 0 || !this.recorder || !this.isStartRecording) {
//       throw new Error('No video chunks to output');
//     }

//     this.isStartRecording = false;
//     this.recorder.stop();
//     const blob = new Blob(this.chunks, { type: 'video/webm' });
//     return blob;
//   }
// }

// const screenRecorder = new ScreenRecorder();

// const blobToDataURL = (blob, callback) => {
//   const fileReader = new FileReader();
//   fileReader.onload = function (e) {
//     callback(e.target.result);
//   };
//   fileReader.readAsDataURL(blob);
// };

/**
 * @returns {boolean} true iff is iframe created by sidenotion
 */
const isSideNotionIFrame = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const src = urlParams.get('src');
  return src === 'sidenotion';
};

const isActiveVideoURL = async () => {
  const videoURL = await getVideoURL();
  return videoURL === window.location.href;
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

const showActiveVideo = () => {
  const videoElement = getVideoElement();
  videoElement.style.boxShadow = '0 0 0 4px rgb(127 218 255)';
};

const handleMessage = async (message, sendResponse) => {
  try {
    switch (message.action) {
      case GET_VIDEO_POSITION_DATA:
        sendResponse(getVideoPosition());
        break;
      case TAKE_CANVAS_SHOT:
        if (!isSideNotionIFrame() && !(await isActiveVideoURL())) {
          return;
        }
        sendResponse(captureVideoIFrame());
        break;
      case SHOW_CAPTURE_AREA:
        showCaptureArea();
        sendResponse({ success: true });
        break;
      case GET_SCREEN_WIDTH:
        sendResponse({ screenWidth: window.screen.availWidth });
        break;
      case QUERY_HAS_VIDEO:
        const hasVideo = getVideoElement() !== null;
        sendResponse({ hasVideo });
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
