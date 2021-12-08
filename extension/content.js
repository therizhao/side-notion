/* eslint-disable no-console */
/* eslint-disable no-undef */

/**
 *
 * @param {string} activeWindowID to take video screenshot from
 * @param {boolean} isSameWindow true iff video frame is in same window
 * @returns {Promise<string>} dataURI of screenshot
 */
const takeScreenshot = async (activeWindowID) => {
  const { dataURI, videoPositionData } = await chromeSendRuntimeMessage({
    action: TAKE_SCREEN_SHOT,
    activeWindowID,
  });
  const croppedDataURI = await cropImage(dataURI, videoPositionData);
  return croppedDataURI;
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

const getNotionScroller = () => document.querySelector('div.notion-scroller.vertical.horizontal');

const getNotionScrollHeight = () => getNotionScroller().scrollTop;

const scrollToPositionNotion = (scrollTop) => {
  const notionScroller = getNotionScroller();
  notionScroller.scrollTo(0, scrollTop);
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
  const scrollTop = getNotionScrollHeight();
  await copyBlobToClipboard(blob);
  pasteFromClipboardToNotion();
  // Scroll back to previous position (Notion automatically scrolls to top after paste)
  scrollToPositionNotion(scrollTop);
};

/**
 *
 * @param {string} activeWindowID to call actions on
 * @param {boolean} isSameWindow true iff video frame is in same window
 * @param {KeyboardEvent} event
 */
const handleKeyDown = async (activeWindowID, isSameWindow, event) => {
  try {
    // cmd + shift + ,
    if (
      (event.metaKey || event.ctrlKey)
      && event.shiftKey
      && event.key === ','
    ) {
      console.log('fired ss');
      const dataURI = await takeScreenshot(activeWindowID, isSameWindow);
      const imageBlob = dataURItoBlob(dataURI);
      pasteToNotion(imageBlob);
      return;
    }

    // cmd + shift + k
    if (
      (event.metaKey || event.ctrlKey)
      && event.shiftKey
      && event.key === 'k'
    ) {
      await chromeSendRuntimeMessage({
        action: SHOW_CAPTURE_AREA,
        activeWindowID,
      });
      return;
    }
  } catch (err) {
    sendAlert(NOTION_ERR_MESSAGE);
    chrome.storage.local.clear();
    throw err;
  }
};

/**
 *
 * @param {string} activeWindowID
 * @param {boolean} isSameWindow true iff video frame is in same window
 */
const addKeydownListener = (activeWindowID, isSameWindow) => {
  document.documentElement.addEventListener('keydown', (event) => {
    handleKeyDown(activeWindowID, isSameWindow, event);
  });
};

const showUsageHint = (usageHints) => {
  const bodyElement = getBodyElement();
  const renderChild = ({ label, cmd }) => {
    addCustomStyles(`
      .usage-hint {
        position: absolute;
        bottom: 16px;
        right: 16px;
        padding: 6px 12px;
        background: white;
        width: 193px;
        color: rgb(55, 53, 47);
        box-shadow: rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px;
        border-radius: 3px;
        z-index: 101;
        font-size: 14px;
      }

      .child-container {
        width: 100%;
        margin-bottom: 6px;
        display: inline-flex;
        justify-content: space-between;
        align-items: center;
      }

      .child-container:last-child {
        margin-bottom: 0px;
      }

      .child-label {
        margin-right: 7px;
        color: rgba(55, 53, 47, 0.6);    
      }

      .child-cmd {
        color: rgb(175, 175, 175);
        font-family: SFMono-Regular, Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace;
        font-size: 90%;
        line-height: normal;
      }

      ${
  bodyElement.classList.contains('dark')
    ? `
        .usage-hint {
          background: rgb(63, 68, 71);
          box-shadow: rgb(15 15 15 / 10%) 0px 0px 0px 1px, rgb(15 15 15 / 20%) 0px 3px 6px, rgb(15 15 15 / 40%) 0px 9px 24px;
        }

        .child-label {
          color: rgba(255, 255, 255, 0.8);
        }

        .child-cmd {
          color: rgba(255, 255, 255, 0.9);
        }
      `
    : ''
}
    `);

    const childContainer = document.createElement('div');
    childContainer.className = 'child-container';

    const labelElement = document.createElement('span');
    labelElement.textContent = label;
    labelElement.className = 'child-label';

    const cmdElement = document.createElement('span');
    cmdElement.textContent = cmd;
    cmdElement.className = 'child-cmd';

    childContainer.appendChild(labelElement);
    childContainer.appendChild(cmdElement);
    return childContainer;
  };

  const divElement = document.createElement('div');
  divElement.className = 'usage-hint';
  usageHints.forEach((data) => {
    divElement.appendChild(renderChild(data));
  });

  bodyElement.appendChild(divElement);
};

const addListener = async () => {
  try {
    const { activeWindowID } = await getLocalStorageData(['activeWindowID']);

    addKeydownListener(activeWindowID, false);
    showUsageHint([
      { label: 'Capture', cmd: `${cmdKey}+shift+,` },
      { label: 'Edit area', cmd: `${cmdKey}+shift+k` },
    ]);
  } catch (err) {
    sendAlert(NOTION_ERR_MESSAGE);
    throw err;
  }
};

addListener();
