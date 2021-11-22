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
const getYoutubeID = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
};

/**
 *
 * @param {string} url
 * @returns {string}
 */
const getYoutubeIFrameURL = (url) => {
  const id = getYoutubeID(url);
  return `https://www.youtube.com/embed/${id}`;
};

/**
 *
 * @param {string} videoUrl
 * @returns {HTMLIFrameElement}
 */
const createYoutubeIFrame = (videoUrl) => {
  const youtubeIFrame = document.createElement('iframe');
  youtubeIFrame.title = 'SideNotion Video';
  youtubeIFrame.src = getYoutubeIFrameURL(videoUrl);
  youtubeIFrame.style.width = '50vw';
  youtubeIFrame.style.height = '100vh';
  return youtubeIFrame;
};

/**
 *
 * @param {string} videoUrl
 * @returns {HTMLVideoElement}
 */
const createVideoElement = (videoUrl) => {
  const videoElement = document.createElement('video');
  wrapper.appendChild(videoElement);
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
    return createYoutubeIFrame(videoUrl);
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

const TAKE_SCREENSHOT = 'TAKE_SCREENSHOT';
/**
 *
 * @param {(dataURI: string) => void} callback
 */
const takeScreenshot = (callback) => {
  chrome.runtime.sendMessage({ action: TAKE_SCREENSHOT }, (response) => {
    callback(response);
  });
};

// const fallbackCopyTextToClipboard = (text) => {
//   const textArea = document.createElement('textarea');
//   textArea.value = text;

//   // Avoid scrolling to bottom
//   textArea.style.top = '0';
//   textArea.style.left = '0';
//   textArea.style.position = 'fixed';

//   document.body.appendChild(textArea);
//   textArea.focus();
//   textArea.select();

//   try {
//     const successful = document.execCommand('copy');
//     const msg = successful ? 'successful' : 'unsuccessful';
//     console.log('Fallback: Copying text command was ' + msg);
//   } catch (err) {
//     console.error('Fallback: Oops, unable to copy', err);
//   }

//   document.body.removeChild(textArea);
// };

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
 * @param {Blob} blob
 * @returns {Promise<void>}
 */
const copyBlobToClipboard = async (blob) => {
  // if (!navigator.clipboard) {
  //   fallbackCopyTextToClipboard(text);
  //   return;
  // }

  return await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ]);
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

/**
 *
 * @param {KeyboardEvent} event
 */
const handleKeyDown = (event) => {
  // cmd + shift + .
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === '.') {
    takeScreenshot((dataURI) => {
      const imageBlob = dataURItoBlob(dataURI);
      pasteToNotion(imageBlob);
    });
  }
};

const main = () => {
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

  const videoWrapper = createVideoWrapper(
    'https://www.youtube.com/watch?v=A03oI0znAoc'
  );
  const notionWrapper = createNotionWrapper();

  // Create new body
  const newBody = document.createElement('body');
  newBody.appendChild(videoWrapper);
  newBody.appendChild(notionWrapper);

  // Remove current body
  getBodyElement().remove();
  // Add new body
  document.documentElement.appendChild(newBody);

  document.documentElement.addEventListener('keydown', handleKeyDown);
};

main();
