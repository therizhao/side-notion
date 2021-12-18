/* eslint-disable no-underscore-dangle */
/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable no-undef */

const startTutorial = () => {
  addCustomStyles(
    `
      .introjs-overlay {
        display: none;
      }
    `,
  );

  const steps = [
    {
      title: 'Hello 👋',
      intro:
        'This is an interactive tutorial on how to use SideNotion so be sure to try things out 🤗',
    },
    {
      element: document.getElementById(USAGE_HINT_CONTAINER_ID),
      intro: 'Here are the command hints',
      onchange: () => {
        scrollToBottomNotion();
      },
    },
    {
      element: document.getElementById(CAPTURE_HINT_ID),
      intro:
        'Click on the Notion doc to focus. Try capturing a screenshot by entering cmd+shift+,',
    },
    {
      element: document.getElementById(TOGGLE_CAPTURE_AREA_HINT_ID),
      intro:
        'Wonderful! Now try showing the capture area by entering cmd+shift+k',
    },
    {
      intro:
        'See the blue box on the left window? Resize the capture area by dragging its borders',
    },
    {
      element: document.getElementById(CAPTURE_HINT_ID),
      intro: 'Try capturing a screenshot again by entering cmd+shift+,', // The image captured should be that within the box area
    },
    {
      element: document.getElementById(TOGGLE_CAPTURE_AREA_HINT_ID),
      intro: 'Awesome! Now try hiding the capture area by entering cmd+shift+k',
    },
    {
      element: document.getElementById(CAPTURE_HINT_ID),
      intro:
        'When you try capturing a screenshot again the same capture area would be captured',
    },
    {
      element: document.getElementById(TUTORIAL_HINT_ID),
      intro:
        "If you need to go through the tutorial again, just enter cmd+shift+m (don't fire it now, it'll restart the tutorial)",
    },
    {
      intro:
        'That’s all 🎉If you want to reset the crop area to the original video size, simply refresh this Notion window.',
    },
  ];

  const intro = introJs();
  intro.setOptions({
    exitOnOverlayClick: false,
    scrollToElement: true,
    disableInteraction: false,
    overlayOpacity: 0,
    steps,
  });

  intro
    .onchange(() => {
      if (steps[intro._currentStep].onchange) {
        steps[intro._currentStep].onchange();
      }
    })
    .onbeforechange(() => {
      if (steps[intro._currentStep].onbeforechange) {
        steps[intro._currentStep].onbeforechange();
      }
    })
    .start();
};

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

const scrollToBottomNotion = () => {
  const notionScroller = getNotionScroller();
  if (notionScroller) {
    notionScroller.scrollTo(0, notionScroller.scrollHeight);
    return;
  }
  setTimeout(scrollToBottomNotion, 500);
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
      // Event.key support for AZERTY keyboard
      && (event.code === 'Comma' || event.key === ',')
    ) {
      const dataURI = await takeScreenshot(activeWindowID, isSameWindow);
      const imageBlob = dataURItoBlob(dataURI);
      pasteToNotion(imageBlob);
      return;
    }

    // cmd + shift + k
    if (
      (event.metaKey || event.ctrlKey)
      && event.shiftKey
      // Event.key support for AZERTY keyboard
      && (event.code === 'KeyK' || event.key.toUpperCase() === 'K')
    ) {
      await chromeSendRuntimeMessage({
        action: TOGGLE_CAPTURE_AREA,
        activeWindowID,
      });
      return;
    }

    // cmd + shift + m
    if (
      (event.metaKey || event.ctrlKey)
      && event.shiftKey
      // Event.key support for AZERTY keyboard
      && (event.code === 'KeyM' || event.key.toUpperCase() === 'M')
    ) {
      startTutorial();
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
  addCustomStyles(`
    .usage-hint {
      position: absolute;
      bottom: 16px;
      right: 16px;
      padding: 6px 12px;
      background: white;
      width: 223px;
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

  const renderChild = ({ label, cmd, id }) => {
    const childContainer = document.createElement('div');
    childContainer.id = id;
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
  divElement.id = USAGE_HINT_CONTAINER_ID;
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
      {
        label: 'Capture',
        cmd: `${cmdKey}+shift+,`,
        id: CAPTURE_HINT_ID,
      },
      {
        label: 'Show/hide area',
        cmd: `${cmdKey}+shift+k`,
        id: TOGGLE_CAPTURE_AREA_HINT_ID,
      },
      {
        label: 'Show tutorial',
        cmd: `${cmdKey}+shift+m`,
        id: TUTORIAL_HINT_ID,
      },
    ]);
    startTutorial();
  } catch (err) {
    sendAlert(NOTION_ERR_MESSAGE);
    throw err;
  }
};

addListener();
