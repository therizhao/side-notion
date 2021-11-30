const TAKE_SCREENSHOT = 'TAKE_SCREENSHOT';
const NOTION_URL = 'https://www.notion.so';

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
const captureVideo = () => {
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

/**
 * @returns {boolean} true iff is iframe created by sidenotion
 */
const getVideoURL = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['videoURL'], (items) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      return resolve(items.videoURL);
    });
  });
};

const isActiveVideoURL = async () => {
  const videoURL = await getVideoURL();
  return videoURL === window.location.href;
};

const handleMessage = async (message, sendResponse) => {
  try {
    console.log(message);
    if (!isSideNotionIFrame() && !(await isActiveVideoURL())) {
      return;
    }

    switch (message.request.action) {
      case TAKE_SCREENSHOT:
        sendResponse(captureVideo());
        break;
      // case START_SCREEN_RECORDING:
      //   screenRecorder.startRecording();
      //   sendResponse('Recording started');
      //   break;
      // case END_SCREEN_RECORDING:
      //   const blob = screenRecorder.endRecording();
      //   blobToDataURL(blob, sendResponse);
      //   break;
      default:
        break;
    }
  } catch (error) {
    console.error('Unexpected error', error);
  }
};

const main = () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sendResponse);
    return true;
  });
};

main();
