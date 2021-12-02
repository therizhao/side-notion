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

/**
 *
 * @param {string} tabID to take video screenshot from
 * @returns {Promise<string>} dataURI of screenshot
 */
const takeScreenshot = (tabID) => {
  return chromeSendRuntimeMessage({
    action: TAKE_SCREEN_SHOT,
    tabID,
  });
};

/**
 *
 * @param {Blob} blob
 * @returns {Promise<void>}
 */
const copyBlobToClipboard = (blob) => {
  const clipboardItem = new ClipboardItem({
    [blob.type]: blob,
  });
  return navigator.clipboard.write([clipboardItem]);
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
const handleKeyDown = async (tabID, event) => {
  try {
    // cmd + shift + .
    if (
      (event.metaKey || event.ctrlKey) &&
      event.shiftKey &&
      event.key === '.'
    ) {
      const dataURI = await takeScreenshot(tabID);
      const imageBlob = dataURItoBlob(dataURI);
      pasteToNotion(imageBlob);
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
  } catch (err) {
    errorLog(handleKeyDown.name, err);
  }
};

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

  const videoWrapper = createVideoWrapper(videoURL);
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

const addListener = async () => {
  console.log('hi');
  try {
    const { videoURL, activeTabID } = await getLocalStorageData([
      'videoURL',
      'activeTabID',
    ]);
    const currentTabID = await getCurrentTabID();

    console.log('hi', activeTabID, currentTabID);

    if (isYoutubeOrVimeo(videoURL)) {
      addIFrameElements(videoURL);
      addKeydownListener(currentTabID);
      return;
    }

    addKeydownListener(activeTabID);
  } catch (err) {
    errorLog(addListener.name, err);
  } finally {
    // Reset video url
    // chrome.storage.local.clear();
    // later only clear if leave window
  }
};

addListener();
