/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
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

class Command {
  /**
   *
   * @param {string} action
   * @param {string} cmd
   * @param {string} label
   * @param {string} id
   */
  constructor(action, cmd, label, id) {
    this.action = action;
    this.cmd = cmd;
    this.label = label;
    this.id = id;
  }

  /**
   *
   * @param {string} cmd Mousetrap command string to set
   */
  setCmd(cmd) {
    this.cmd = cmd;
  }

  /**
   *
   * @returns {string}
   */
  getDisplayedCmd() {
    const displayedCmdKey = isMac ? 'cmd' : 'ctrl';
    let displayedCmd = this.cmd.replace('mod', displayedCmdKey);
    displayedCmd = displayedCmd.replace('meta', 'cmd');
    displayedCmd = displayedCmd.replace('space', '␣');
    return displayedCmd;
  }
}

/**
 *
 * @param {Object} commandObject
 */
const isValidCommand = (commandObject) => ['action', 'cmd', 'label', 'id'].every((prop) => prop in commandObject);

/**
 *
 * @param {Command[]} commands
 */
const updateCommandsStorage = async (commands) => {
  const commandsObjArr = commands.map(({
    action, label, cmd, id,
  }) => ({
    action,
    cmd,
    label,
    id,
  }));
  await setLocalStorageData({ commands: JSON.stringify(commandsObjArr) });
};

/**
 *
 * @param {Object[]} commands
 */
const constructCommandsList = (commands) => commands.map(
  (command) => new Command(command.action, command.cmd, command.label, command.id),
);

const getCommands = async () => {
  const { commands } = await getLocalStorageData(['commands']);
  if (commands) {
    const commandsObjList = JSON.parse(commands);
    if (commandsObjList.every(isValidCommand)) {
      return constructCommandsList(commandsObjList);
    }
  }

  await setLocalStorageData({ commands: JSON.stringify(defaultCommandsJson) });
  return constructCommandsList(defaultCommandsJson);
};

/**
 *
 * @param {Command[]} commands
 * @param {string} action
 * @returns
 */
const getCommandFromCommandList = (commands, action) => commands.find((command) => command.action === action);

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
  const {
    x, y, width, height,
  } = positionData;

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

const isDarkMode = () => getBodyElement().classList.contains('dark');

/**
 *
 * @returns {HTMLVideoElement}
 */
const getVideoElement = () => document.documentElement.querySelector('video');

/**
 *
 * @param {HTMLVideoElement} videoElement
 * @returns {boolean} true iff video is playing
 * Source: https://stackoverflow.com/questions/6877403/how-to-tell-if-a-video-element-is-currently-playing
 */
const isVideoPlaying = (videoElement) => !!(
  videoElement.currentTime > 0
    && !videoElement.paused
    && !videoElement.ended
    && videoElement.readyState > 2
);

/**
 *
 * @param {Element} element
 */
const hideElementIfExist = (element) => {
  if (element) {
    element.style.visibility = 'hidden';
  }
};

/**
 *
 * @param {Element} element
 */
const showElementIfExist = (element) => {
  if (element) {
    element.style.visibility = 'visible';
  }
};

/**
 *
 * @param {string} message
 */
const sendAlert = (message) => {
  alert(message);
};

const isYoutube = () => window.location.hostname.includes('youtube.com');
const isZoom = () => window.location.hostname.includes('zoom.us');

/**
 *
 * @param {number} ms number of ms to wait for
 * @returns {Promise<void>}
 */
const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

/**
 *
 * @param {KeyboardEvent} event
 * @param {string} matchCode
 * @param {string} matchKey should always be lowercase
 * @returns {boolean} true iff matches key and code
 * See here for event key and code https://keycode.info/
 */
const isCmdShiftKey = (event, matchCode, matchKey) => (event.metaKey || event.ctrlKey)
  && event.shiftKey
  // Event.key support for AZERTY keyboard
  && (event.code === matchCode || event.key.toLowerCase() === matchKey);

/**
 *
 * @param {Element} element
 */
const flashHighlightElement = (element) => {
  element.style.transition = 'box-shadow 0.2s';
  if (isDarkMode()) {
    element.style.boxShadow = '0 0 0 1px white';
  } else {
    element.style.boxShadow = `0 0 0 2px ${NOTION_BLACK}`;
  }
  setTimeout(() => {
    element.style.boxShadow = 'none';
  }, 1000);
};

/**
 * @param {string} html representing a single element
 * @return {Element}
 */
const htmlStringToElement = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
};

/**
 *
 * @param {Object[]} commands
 */
const getCommand = (commands, action) => commands.find((command) => command.action === action);

const getCommandUsageHint = (commands, action) => {
  const command = getCommand(action);
  return {
    label: command.label,
    cmd: mouseTrapCmdToReadableCmd(command.cmd),
    id: command.id,
  };
};

/**
 *
 * @param {Element} parentNode
 * @param {string} className
 */
const removeElementsByClassFromParent = (parentNode, className) => {
  const elements = parentNode.getElementsByClassName(className);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
};
