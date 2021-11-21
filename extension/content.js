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

/**
 *
 * @param {string} dataURI
 */
const pasteToNotion = (dataURI) => {
  // https://stackoverflow.com/questions/22702446/how-to-get-clipboard-data-in-chrome-extension
};

/**
 *
 * @param {KeyboardEvent} event
 */
const handleKeyDown = (event) => {
  // cmd + shift + .
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === '.') {
    takeScreenshot((dataURI) => {
      pasteToNotion(dataURI);
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
