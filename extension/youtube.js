const START_SCREEN_RECORDING = 'START_SCREEN_RECORDING';
const END_SCREEN_RECORDING = 'END_SCREEN_RECORDING';
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
const takeScreenshot = () => {
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

class ScreenRecorder {
  constructor() {
    /**
     * @type {boolean}
     */
    this.isStartRecording = false;
    /**
     * @type {HTMLCanvasElement}
     */
    this.canvasElement = null;

    this.chunks = [];

    this.mediaStream = null;
  }

  startRecording() {
    console.log('youtube, recording start');
    this.isStartRecording = true;

    // Start recording
    const videoElement = getVideoElement();
    const { width, height } = videoElement.getBoundingClientRect();

    this.canvasElement = document.createElement('canvas');
    this.canvasElement.width = width;
    this.canvasElement.height = height;

    const mediaStream = new MediaStream(this.canvasElement.captureStream(60)); // 60 fps
    console.log('mediaStream', mediaStream);
    this.recorder = new MediaRecorder(mediaStream, {
      mimeType: 'video/webm',
    });
    this.recorder.start(16);
    console.log('recorder', this.recorder);
    this.recorder.ondataavailable = (ev) => {
      console.log('chunk', ev);
      this.chunks.push(ev.data);
    };
    this.recorder.onstop = () => {
      console.log('STOPPED');
    };

    this.recordFrame(videoElement);
  }

  recordFrame(videoElement) {
    if (!this.isStartRecording || !this.canvasElement) {
      return;
    }

    setTimeout(() => {
      const ctx = this.canvasElement.getContext('2d');
      ctx.drawImage(
        videoElement,
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );
      this.recordFrame(videoElement);
    }, 16); // Record at 60 fps
  }

  /**
   *
   * @returns {Blob} screen recording blob
   */
  endRecording() {
    // console.log(this.chunks, this.recorder, this.startRecording);
    // if (this.chunks.length <= 0 || !this.recorder || !this.startRecording) {
    //   return null;
    // }

    console.log('chunksss', this.chunks);
    this.isStartRecording = false;
    this.recorder.stop();
    const blob = new Blob(this.chunks, { type: this.chunks[0].type });
    return blob;

    // const dataURI = this.canvasElement.toDataURL('video/webm');
    // this.canvasElement = null;
    // console.log('dataURI', dataURI);
    // return dataURI;
  }
}

const screenRecorder = new ScreenRecorder();

const blobToDataURL = (blob, callback) => {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    callback(e.target.result);
  };
  fileReader.readAsDataURL(blob);
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Only allow notion to send request to us
  if (message.sender.origin !== NOTION_URL) {
    return;
  }

  console.log(message.request);
  switch (message.request.action) {
    case TAKE_SCREENSHOT:
      sendResponse(takeScreenshot());
      break;
    case START_SCREEN_RECORDING:
      screenRecorder.startRecording();
      sendResponse('Recording started');
      break;
    case END_SCREEN_RECORDING:
      console.log('END RECORDING');
      const blob = screenRecorder.endRecording();
      blobToDataURL(blob, sendResponse);
      break;
    default:
      break;
  }
});
