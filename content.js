/* eslint-disable no-underscore-dangle */
/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable no-undef */

/**
 * Singleton class
 */
class Tutorial {
  constructor(intro) {
    this.isShowing = false;
    this.intro = intro;
  }

  static init() {
    addCustomStyles(
      `
        .introjs-overlay {
          display: none;
        }
      `,
    );

    return new Tutorial(introJs());
  }

  skipStepIfMatchCmd(matchCode, matchKey) {
    const nextStepIfMatch = (event) => {
      if (isCmdShiftKey(event, matchCode, matchKey)) {
        this.intro.nextStep();
        document.removeEventListener('keydown', nextStepIfMatch);
      }
    };
    document.addEventListener('keydown', nextStepIfMatch);
  }

  /**
   * Iff an intro is already showing, exit the intro before start a new one
   */
  show(activeWindowID) {
    if (this.isShowing) {
      this.intro.exit();
      return;
    }

    this.isShowing = true;
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
        intro: `Click on the Notion doc to focus. Try capturing a screenshot by entering ${CAPTURE_CMD}`,
        onchange: () => {
          this.skipStepIfMatchCmd(CAPTURE_CODE, CAPTURE_KEY);
        },
      },
      {
        element: document.getElementById(SHOW_HIDE_AREA_HINT_ID),
        intro: `Wonderful! Now try showing the capture area by entering ${SHOW_HIDE_AREA_CMD}`,
        onchange: () => {
          this.skipStepIfMatchCmd(SHOW_HIDE_AREA_CODE, SHOW_HIDE_AREA_KEY);
        },
      },
      {
        intro:
          'See the blue box on the left window? Resize the capture area by dragging its borders',
      },
      {
        element: document.getElementById(CAPTURE_HINT_ID),
        intro: `Try capturing a screenshot again by entering ${CAPTURE_CMD}`, // The image captured should be that within the box area
        onchange: () => {
          this.skipStepIfMatchCmd(CAPTURE_CODE, CAPTURE_KEY);
        },
      },
      {
        element: document.getElementById(SHOW_HIDE_AREA_HINT_ID),
        intro: `Awesome! Now try hiding the capture area by entering ${SHOW_HIDE_AREA_CMD}`,
        onchange: () => {
          this.skipStepIfMatchCmd(SHOW_HIDE_AREA_CODE, SHOW_HIDE_AREA_KEY);
        },
      },
      {
        element: document.getElementById(CAPTURE_HINT_ID),
        intro:
          'When you try capturing a screenshot again the same capture area would be captured',
        onchange: () => {
          this.skipStepIfMatchCmd(CAPTURE_CODE, CAPTURE_KEY);
        },
      },
      {
        element: document.getElementById(PLAY_PAUSE_HINT_ID),
        intro: 'Try pausing the video by entering cmd+shift+space',
        onchange: () => {
          this.skipStepIfMatchCmd(PLAY_PAUSE_CODE, PLAY_PAUSE_KEY);
        },
      },
      {
        element: document.getElementById(PLAY_PAUSE_HINT_ID),
        intro: 'Try playing the video by entering cmd+shift+space',
        onchange: () => {
          this.skipStepIfMatchCmd(PLAY_PAUSE_CODE, PLAY_PAUSE_KEY);
        },
      },
      {
        element: document.getElementById(INCREASE_SPEED_HINT_ID),
        intro: `Try increasing the video speed by entering ${INCREASE_SPEED_CMD}`,
        onchange: () => {
          this.skipStepIfMatchCmd(INCREASE_SPEED_CODE, INCREASE_SPEED_KEY);
        },
      },
      {
        element: document.getElementById(DECREASE_SPEED_HINT_ID),
        intro: `Try decreasing the video speed by entering ${DECREASE_SPEED_CMD}`,
        onchange: () => {
          this.skipStepIfMatchCmd(DECREASE_SPEED_CODE, DECREASE_SPEED_KEY);
        },
      },
      {
        element: document.getElementById(SKIP_5S_HINT_ID),
        intro: `Try skip 5s of the video by entering ${SKIP_5S_CMD}`,
        onchange: () => {
          this.skipStepIfMatchCmd(SKIP_5S_CODE, SKIP_5S_KEY);
        },
      },
      {
        element: document.getElementById(BACK_5S_HINT_ID),
        intro: `Try go back 5s of the video by entering ${BACK_5S_CMD}`,
        onchange: () => {
          this.skipStepIfMatchCmd(BACK_5S_CODE, BACK_5S_KEY);
        },
      },
      {
        element: document.getElementById(SHOW_TUTORIAL_HINT_ID),
        intro: `That’s all 🎉. If you need to go through the tutorial again, just enter ${SHOW_TUTORIAL_CMD}`,
        onchange: () => {
          chromeSendRuntimeMessage({
            action: DISABLE_CAPTURE_AREA,
            activeWindowID,
          });
        },
      },
    ];

    this.intro.setOptions({
      exitOnOverlayClick: false,
      scrollToElement: true,
      disableInteraction: false,
      overlayOpacity: 0,
      keyboardNavigation: false,
      steps,
    });

    this.intro
      .onchange(() => {
        // Bound check for current step as something it can increase too fast and go out of bounds
        if (
          this.intro._currentStep < steps.length
          && steps[this.intro._currentStep].onchange
        ) {
          steps[this.intro._currentStep].onchange();
        }
      })
      .onbeforechange(() => {
        if (
          this.intro._currentStep < steps.length
          && steps[this.intro._currentStep].onbeforechange
        ) {
          steps[this.intro._currentStep].onbeforechange();
        }
      })
      .onafterchange(() => {
        if (
          this.intro._currentStep < steps.length
          && steps[this.intro._currentStep].onafterchange
        ) {
          steps[this.intro._currentStep].onafterchange();
        }
      })
      .onexit(() => {
        this.isShowing = false;
      })
      .start();
  }
}

const tutorial = Tutorial.init();

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
    // Capture
    if (isCmdShiftKey(event, CAPTURE_CODE, CAPTURE_KEY)) {
      flashHighlightElement(document.getElementById(CAPTURE_HINT_ID));

      const dataURI = await takeScreenshot(activeWindowID, isSameWindow);
      const imageBlob = dataURItoBlob(dataURI);
      await pasteToNotion(imageBlob);
      // Add a string to create new block
      await pasteToNotion(new Blob(['.'], { type: 'text/plain' }));
      await wait(100);
      // Enter to focus the block (needa wait to be effective)
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        keyCode: 13,
        code: 'Enter',
        bubbles: true,
      });
      document.activeElement.dispatchEvent(enterEvent);
      await wait(100);
      // Backspace to remove text (needa wait to be effective)
      const backspaceEvent = new KeyboardEvent('keydown', {
        key: 'Backspace',
        code: 'Backspace',
        bubbles: true,
        keyCode: 8,
      });
      document.activeElement.dispatchEvent(backspaceEvent);
      return;
    }

    // Play pause
    if (isCmdShiftKey(event, PLAY_PAUSE_CODE, PLAY_PAUSE_KEY)) {
      flashHighlightElement(document.getElementById(PLAY_PAUSE_HINT_ID));

      await chromeSendRuntimeMessage({
        action: PLAY_PAUSE_VIDEO,
        activeWindowID,
      });
      return;
    }

    // Show/hide area
    if (isCmdShiftKey(event, SHOW_HIDE_AREA_CODE, SHOW_HIDE_AREA_KEY)) {
      flashHighlightElement(document.getElementById(SHOW_HIDE_AREA_HINT_ID));

      await chromeSendRuntimeMessage({
        action: TOGGLE_SHOW_HIDE_CAPTURE_AREA,
        activeWindowID,
      });
      return;
    }

    // Show tutorial
    if (isCmdShiftKey(event, SHOW_TUTORIAL_CODE, SHOW_TUTORIAL_KEY)) {
      flashHighlightElement(document.getElementById(SHOW_TUTORIAL_HINT_ID));

      tutorial.show(activeWindowID);
      return;
    }

    // Skip 5s
    if (isCmdShiftKey(event, SKIP_5S_CODE, SKIP_5S_KEY)) {
      flashHighlightElement(document.getElementById(SKIP_5S_HINT_ID));

      await chromeSendRuntimeMessage({
        action: SKIP_5S,
        activeWindowID,
      });
      return;
    }

    // Back 5s
    if (isCmdShiftKey(event, BACK_5S_CODE, BACK_5S_KEY)) {
      flashHighlightElement(document.getElementById(BACK_5S_HINT_ID));

      await chromeSendRuntimeMessage({
        action: BACK_5S,
        activeWindowID,
      });
      return;
    }

    // Increase speed
    if (isCmdShiftKey(event, INCREASE_SPEED_CODE, INCREASE_SPEED_KEY)) {
      flashHighlightElement(document.getElementById(INCREASE_SPEED_HINT_ID));

      await chromeSendRuntimeMessage({
        action: INCREASE_SPEED,
        activeWindowID,
      });
      return;
    }

    // Decrease speed
    if (isCmdShiftKey(event, DECREASE_SPEED_CODE, DECREASE_SPEED_KEY)) {
      flashHighlightElement(document.getElementById(DECREASE_SPEED_HINT_ID));

      await chromeSendRuntimeMessage({
        action: DECREASE_SPEED,
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
    const { activeWindowID, hasShownTutorial } = await getLocalStorageData([
      'activeWindowID',
      'hasShownTutorial',
    ]);

    addKeydownListener(activeWindowID, false);
    showUsageHint([
      {
        label: 'Capture',
        cmd: CAPTURE_CMD,
        id: CAPTURE_HINT_ID,
      },
      {
        label: 'Play/pause',
        cmd: PLAY_PAUSE_CMD,
        id: PLAY_PAUSE_HINT_ID,
      },
      {
        label: 'Skip 5s',
        cmd: SKIP_5S_CMD,
        id: SKIP_5S_HINT_ID,
      },
      {
        label: 'Back 5s',
        cmd: BACK_5S_CMD,
        id: BACK_5S_HINT_ID,
      },
      {
        label: 'Faster',
        cmd: INCREASE_SPEED_CMD,
        id: INCREASE_SPEED_HINT_ID,
      },
      {
        label: 'Slower',
        cmd: DECREASE_SPEED_CMD,
        id: DECREASE_SPEED_HINT_ID,
      },
      {
        label: 'Show/hide area',
        cmd: SHOW_HIDE_AREA_CMD,
        id: SHOW_HIDE_AREA_HINT_ID,
      },
      {
        label: 'Show tutorial',
        cmd: SHOW_TUTORIAL_CMD,
        id: SHOW_TUTORIAL_HINT_ID,
      },
    ]);
    if (!hasShownTutorial) {
      tutorial.show(activeWindowID);
      await setLocalStorageData({ hasShownTutorial: true });
    }
  } catch (err) {
    sendAlert(NOTION_ERR_MESSAGE);
    throw err;
  }
};

/**
 * Init notion content script when enter notion page
 * Initialisation is done only one
 * Note: Cannot just do matching in manifest
 * Reference: https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes
 */
const main = () => {
  let isInitialised = false;
  let oldHref = window.location.href;

  const addListenerIfMatchNotionPageUrl = () => {
    if (window.location.href.match(/https:\/\/www.notion.so\/(.*)\/(.*)/g)) {
      addListener();
      isInitialised = true;
    }
  };

  // Start of activation code
  addListenerIfMatchNotionPageUrl();

  // End of activation code
  if (!isInitialised) {
    window.onload = () => {
      const bodyList = document.querySelector('body');

      const observer = new MutationObserver((mutations) => {
        mutations.forEach(() => {
          if (oldHref !== window.location.href) {
            oldHref = document.location.href;
            // Start of activation code
            addListenerIfMatchNotionPageUrl();
            // End of activation code
          }
        });
      });

      const config = {
        childList: true,
        subtree: true,
      };

      observer.observe(bodyList, config);
    };
  }
};

main();
