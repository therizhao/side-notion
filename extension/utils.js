/* eslint-disable no-alert */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

// CHROME UTILS

const chromeCallbackHandler = (resolve, reject) => (response) => {
  if (chrome.runtime.lastError) {
    return reject(chrome.runtime.lastError);
  }
  return resolve(response);
};

/**
 *
 * @param {string[]} keys
 */
const getLocalStorageData = (keys) => new Promise((resolve, reject) => {
  chrome.storage.local.get(keys, chromeCallbackHandler(resolve, reject));
});

/**
 *
 * @param {Object} data
 */
const setLocalStorageData = (data) => new Promise((resolve, reject) => {
  chrome.storage.local.set(data, chromeCallbackHandler(resolve, reject));
});

const chromeSendRuntimeMessage = (message) => new Promise((resolve, reject) => {
  chrome.runtime.sendMessage(message, chromeCallbackHandler(resolve, reject));
});

/**
 * @returns {boolean} true iff is iframe created by sidenotion
 */
const getVideoURL = () => getLocalStorageData(['videoURL']);

// GENERAL UTILS

/**
 *
 * @param {string} dataURI
 * @returns {Blob}
 */
const dataURItoBlob = (dataURI) => {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  const byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  const ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  const blob = new Blob([ab], { type: mimeString });
  return blob;
};

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

/** @returns {HTMLBodyElement} */
const getBodyElement = () => {
  const body = document.documentElement.getElementsByTagName('body')[0];
  return body;
};

/**
 *
 * @returns {HTMLVideoElement}
 */
const getVideoElement = () => document.documentElement.querySelector('video');

/**
 *
 * @param {string} message
 */
const sendAlert = (message) => {
  alert(message);
};

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const cmdKey = isMac ? 'cmd' : 'ctrl';
