// CHROME UTILS

const chromeCallbackHandler = (resolve, reject) => {
  return (response) => {
    if (chrome.runtime.lastError) {
      return reject(chrome.runtime.lastError);
    }
    return resolve(response);
  };
};

/**
 *
 * @param {string[]} keys
 */
const getLocalStorageData = (keys) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, chromeCallbackHandler(resolve, reject));
  });
};

/**
 *
 * @param {Object} data
 */
const setLocalStorageData = (data) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, chromeCallbackHandler(resolve, reject));
  });
};

const chromeSendRuntimeMessage = (message) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, chromeCallbackHandler(resolve, reject));
  });
};

/**
 *
 * @typedef DisplayUnitInfo
 *
 */

/**
 *
 * @returns {Promise<DisplayUnitInfo[]>}
 */
const chromeGetDisplayInfo = () => {
  return chrome.system.display.getInfo();
};

/**
 * @returns {boolean} true iff is iframe created by sidenotion
 */
const getVideoURL = () => {
  return getLocalStorageData(['videoURL']);
};

/**
 *
 * @returns {Promise<string>} current tab id
 */
const getCurrentTabIDFromBackground = async () => {
  const { tabID } = await chromeSendRuntimeMessage({
    action: GET_CURRENT_TAB_ID,
  });
  return tabID;
};

// GENERAL UTILS

/**
 *
 * @param {string} dataURI
 * @returns {Blob}
 */
const dataURItoBlob = (dataURI) => {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  let byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  let ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  let ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  let blob = new Blob([ab], { type: mimeString });
  return blob;
};

/**
 *
 * @param {string} dataurl
 * @param {string} filename
 * @returns
 */
function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

/**
 * @param {string} src
 * @param {Error} err
 */
const errorLog = (src, err) => {
  console.error(`src: ${src}, error: ${err.message}`);
};

/**
 *
 * @param {string} url
 * @returns {boolean}
 */
const isYoutubeOrVimeo = (url) =>
  url.includes('youtube.com') || url.includes('vimeo.com');

// DOM UTILS

const cropImage = (dataURI, positionData) => {
  const scale = window.devicePixelRatio;
  const x = Math.ceil(scale * positionData.x);
  const y = Math.ceil(scale * positionData.y);
  const width = Math.ceil(scale * positionData.width);
  const height = Math.ceil(scale * positionData.height);

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = dataURI;
    img.onload = () => {
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
      ctx.save();
      const croppedDataURI = canvas.toDataURL('image/png');
      resolve(croppedDataURI);
    };
  });
};

const createStylesElement = (cssRules) => {
  const styles = document.createElement('style');
  styles.type = 'text/css';
  styles.innerText = cssRules;
  return styles;
};

const addCustomStyles = (cssRules) => {
  document.head.appendChild(createStylesElement(cssRules));
};

/** @returns {HTMLHtmlElement} */
const getHtmlElement = () => {
  const html = document.documentElement.outerHTML;
  return html;
};

/** @returns {HTMLBodyElement} */
const getBodyElement = () => {
  const body = document.documentElement.getElementsByTagName('body')[0];
  return body;
};

/**
 *
 * @param {string} videoUrl
 * @returns {HTMLVideoElement}
 */
const createVideoElement = (videoUrl) => {
  const videoElement = document.createElement('video');
  videoElement.src = videoUrl;
  return videoElement;
};

/**
 *
 * @returns {HTMLVideoElement}
 */
const getVideoElement = () => {
  return document.documentElement.querySelector('video');
};

/**
 *
 * @param {string} message
 */
const sendAlert = (message) => {
  alert(message);
};

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const cmdKey = isMac ? 'cmd' : 'ctrl';
