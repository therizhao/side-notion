// Actions
const START_SCREEN_RECORDING = 'START_SCREEN_RECORDING';
const END_SCREEN_RECORDING = 'END_SCREEN_RECORDING';
const TAKE_SCREENSHOT = 'TAKE_SCREENSHOT';

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
 * @param {string} url
 * @returns {string}
 */
const getYoutubeIFrameURL = (url) => {
  /**
   *
   * @param {string} url
   * @returns {string}
   */
  const getYoutubeID = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  };

  const id = getYoutubeID(url);
  return `https://www.youtube.com/embed/${id}`;
};

/**
 *
 * @param {string} url
 * @returns {string}
 */
const getVimeoIFrameURL = (url) => {
  const regExp =
    /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
  const parseUrl = regExp.exec(url);
  const videoID = parseUrl[5];

  return `https://player.vimeo.com/video/${videoID}`;
};

/**
 *
 * @param {string} iframeURL
 * @returns {HTMLIFrameElement}
 */
const createVideoIFrame = (iframeURL) => {
  const videoIFrame = document.createElement('iframe');
  videoIFrame.title = 'SideNotion Video';
  // Put src = sidenotion for screencapture.js to identify
  videoIFrame.src = `${iframeURL}?src=sidenotion`;
  videoIFrame.style.width = '50vw';
  videoIFrame.style.height = '100vh';
  videoIFrame.style.background = 'black';
  return videoIFrame;
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
 * @param {string} videoUrl
 * @returns {HTMLElement}
 */
const createVideoComponent = (videoUrl) => {
  if (videoUrl.includes('youtube')) {
    return createVideoIFrame(getYoutubeIFrameURL(videoUrl));
  }

  if (videoUrl.includes('vimeo')) {
    return createVideoIFrame(getVimeoIFrameURL(videoUrl));
  }

  return createVideoElement(videoUrl);
};

/**
 *
 * @param {string} videoUrl
 */
const createVideoWrapper = (videoUrl) => {
  const wrapper = document.createElement('div');
  wrapper.prepend(createVideoComponent(videoUrl));
  return wrapper;
};

/**
 *
 * @returns {HTMLDivElement}
 */
const createNotionWrapper = () => {
  const notionWrapper = document.createElement('div');
  const notionBody = getBodyElement();

  // Copy the children
  while (notionBody.firstChild) {
    notionWrapper.appendChild(notionBody.firstChild); // *Moves* the child
  }

  // Copy the attributes
  for (let index = notionBody.attributes.length - 1; index >= 0; index -= 1) {
    notionWrapper.attributes.setNamedItem(
      notionBody.attributes[index].cloneNode()
    );
  }

  return notionWrapper;
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

/**
 *
 * @param {string} tabID to take video screenshot from
 * @param {(dataURI: string) => void} callback
 */
const takeScreenshot = (tabID, callback) => {
  chrome.runtime.sendMessage({ action: TAKE_SCREENSHOT, tabID }, (response) => {
    callback(response);
  });
};

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
 *
 * @param {Blob} blob
 * @returns {Promise<void>}
 */
const copyBlobToClipboard = async (blob) => {
  try {
    const clipboardItem = new ClipboardItem({
      [blob.type]: blob,
    });
    return await navigator.clipboard.write([clipboardItem]);
  } catch (error) {
    console.log('error', error);
    return null;
  }
};

const scrollToBottomNotion = () => {
  const notionScroller = document.querySelector(
    'div.notion-scroller.vertical.horizontal'
  );
  notionScroller.scrollTo(0, notionScroller.scrollHeight);
};

const pasteFromClipboardToNotion = () => {
  const targetElement = document.querySelector('[contenteditable="false"');
  targetElement.contentEditable = true;
  targetElement.focus();
  document.execCommand('Paste', null, null);
};

/**
 * Pastes blob to notion
 *
 * @param {Blob} blob
 *
 * Reference: https://newbedev.com/why-is-document-execcommand-paste-not-working-in-google-chrome
 */
const pasteToNotion = async (blob) => {
  await copyBlobToClipboard(blob);
  pasteFromClipboardToNotion();
  scrollToBottomNotion();
};

// function simulateDragDrop(sourceNode, destinationNode, file) {
//   let EVENT_TYPES = {
//     DRAG_END: 'dragend',
//     DRAG_START: 'dragstart',
//     DROP: 'drop',
//   };
//   const dataTransfer = new DataTransfer();
//   dataTransfer.items.add(file);

//   function createCustomEvent(type) {
//     let event = new DragEvent(type, { dataTransfer });
//     event.dataTransfer = dataTransfer;
//     return event;
//   }

//   function dispatchEvent(node, type, event) {
//     if (node.dispatchEvent) {
//       return node.dispatchEvent(event);
//     }
//     if (node.fireEvent) {
//       return node.fireEvent('on' + type, event);
//     }
//   }

//   let event = createCustomEvent(EVENT_TYPES.DRAG_START);
//   dispatchEvent(sourceNode, EVENT_TYPES.DRAG_START, event);

//   let dropEvent = createCustomEvent(EVENT_TYPES.DROP);
//   dropEvent.dataTransfer = event.dataTransfer;
//   dispatchEvent(destinationNode, EVENT_TYPES.DROP, dropEvent);

//   let dragEndEvent = createCustomEvent(EVENT_TYPES.DRAG_END);
//   dragEndEvent.dataTransfer = event.dataTransfer;
//   dispatchEvent(sourceNode, EVENT_TYPES.DRAG_END, dragEndEvent);
// }

// const dropToNotion = async (file) => {
//   const firstBlock = document.querySelector(
//     'div.notion-page-content > div:first-child'
//   );
//   const lastBlock = document.querySelector(
//     'div.notion-page-content > div:last-child'
//   );
//   firstBlock.addEventListener('drop', console.log);
//   firstBlock.addEventListener('dragstart', console.log);
//   firstBlock.addEventListener('dragend', console.log);
//   lastBlock.addEventListener('drop', console.log);
//   lastBlock.addEventListener('dragstart', console.log);
//   lastBlock.addEventListener('dragend', console.log);
//   simulateDragDrop(firstBlock, lastBlock, file);
// };

// const tempPasteExp = async () => {
//   const url = 'https://www.youtube.com/watch?v=A03oI0znAoc';
//   const text = new Blob([url], { type: 'text/plain' });
//   const clipboardItem = new ClipboardItem({
//     'text/plain': text,
//   });
//   await navigator.clipboard.write([clipboardItem]);
//   pasteFromClipboardToNotion();
//   scrollToBottomNotion();

//   // Poll recursively for Embed Video button to appear
//   const clicker = () => {
//     const elem = document.querySelector(
//       '.notion-embed-menu div[role="button"]:nth-child(2)'
//     );
//     if (elem) {
//       elem.click();
//       return;
//     }

//     setTimeout(clicker, 100);
//   };

//   clicker();
// };

// class ScreenRecorder {
//   constructor() {
//     this.isStartRecording = false;
//   }

//   startRecording() {
//     window.alert('Recording in process');
//     this.isStartRecording = true;

//     // Start recording
//     const videoElement = document.querySelector('video');
//     chrome.runtime.sendMessage(
//       { action: START_SCREEN_RECORDING },
//       (response) => {
//         console.log(`${START_SCREEN_RECORDING} response`, response);
//       }
//     );
//   }

//   /**
//    *
//    * @param {(dataURI: string) => void} callback
//    */
//   endRecording(callback) {
//     this.isStartRecording = false;
//     chrome.runtime.sendMessage({ action: END_SCREEN_RECORDING }, (response) => {
//       console.log(`${END_SCREEN_RECORDING} response`, response);
//       callback(response);
//     });
//   }
// }

// const screenRecorder = new ScreenRecorder();

/**
 *
 * @param {string} tabID to call actions on
 * @param {KeyboardEvent} event
 */
const handleKeyDown = (tabID, event) => {
  // cmd + shift + .
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === '.') {
    takeScreenshot(tabID, (dataURI) => {
      const imageBlob = dataURItoBlob(dataURI);
      pasteToNotion(imageBlob);
    });
    return;
  }

  // cmd + shift + ,
  // if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === ',') {
  //   if (screenRecorder.isStartRecording) {
  //     screenRecorder.endRecording((dataURI) => {
  //       tempPasteExp();
  //       // const videoBlob = dataURLtoFile(dataURI);
  //       // dropToNotion(videoBlob);
  //     });
  //     return;
  //   }

  //   screenRecorder.startRecording();
  // }
};

/**
 *
 * @param {string[]} keys
 */
const getLocalStorageData = (keys) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (items) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(items);
    });
  });
};

const isYoutubeOrVimeo = () =>
  window.location.href.includes('youtube.com') ||
  window.location.href.includes('vimeo.com');

/**
 *
 * @param {string} videoURL
 */
const addIFrameElements = (videoURL) => {
  addCustomStyles(`
  body {
    display: grid; 
    grid-template-columns: 1fr 1fr;
  }
  
  .notion-frame {
    width: 50vw !important; /* Need to set here since notion js will overwrite the elem.style value */
  }
  
  .notion-selectable.notion-collection_view-block {
    width: 50vw !important; /* Need to set here since notion js will overwrite the elem.style value */
  }
  `);

  const videoWrapper = createVideoWrapper(items.videoURL);
  const notionWrapper = createNotionWrapper();

  // Create new body
  const newBody = document.createElement('body');
  newBody.appendChild(videoWrapper);
  newBody.appendChild(notionWrapper);

  // Remove current body
  getBodyElement().remove();
  // Add new body
  document.documentElement.appendChild(newBody);
};

/**
 *
 * @param {string} tabID
 */
const addKeydownListener = (tabID) => {
  document.documentElement.addEventListener('keydown', (event) => {
    handleKeyDown(tabID, event);
  });
};

const getCurrentTabID = () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      const activeTab = tabs[0];
      return resolve(activeTab.id);
    });
  });
};

const main = async () => {
  try {
    const { videoURL, activeTabID } = await getLocalStorageData([
      'videoURL',
      'activeTabID',
    ]);

    if (isYoutubeOrVimeo()) {
      addIFrameElements(videoURL);
      addKeydownListener(await getCurrentTabID());
      return;
    }

    addKeydownListener(activeTabID);
  } catch (err) {
    console.log('error', err);
  } finally {
    // Reset video url
    // chrome.storage.local.clear();
    // later only clear if leave window
  }
};

main();
