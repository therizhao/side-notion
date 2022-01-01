/* eslint-disable no-param-reassign */
/* eslint-disable max-classes-per-file */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable no-undef */

// Mousetrap object for capturing/editing commands
const commandsTrap = new Mousetrap(document.documentElement);
/**
 *
 * @param {Command} command
 * @param {number} activeWindowID
 */
commandsTrap.update = (command, activeWindowID) => {
  commandsTrap.bind(command.cmd, () => {
    handleCommand(command, activeWindowID);
  });
};

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

        ${isDarkMode() ? `
          .introjs-helperLayer {
            box-shadow: rgb(255 255 255 / 80%) 0px 0px 1px 2px, rgb(255 255 255 / 0%) 0px 0px 0px 5000px !important;
          }` : ''}
      `,
    );

    return new Tutorial(introJs());
  }

  /**
   * Skip to next step when run command
   * @param {Command} command
   */
  skipStepIfMatchCmd(command) {
    const skipStepTrap = new Mousetrap(document.documentElement);

    skipStepTrap.bind(command.cmd, () => {
      this.intro.nextStep();
      // Auto skip step should only run once for the cmd
      skipStepTrap.unbind(command.cmd);
    });
  }

  /**
   * Iff an intro is already showing, exit the intro before start a new one
   *
   * @param {Command[]} commands
   * @param {number} activeWindowID
   */
  show(commands, activeWindowID) {
    if (this.isShowing) {
      this.intro.exit();
      return;
    }

    const capture = getCommandFromCommandList(commands, CAPTURE);
    const showHideArea = getCommandFromCommandList(commands, SHOW_HIDE_AREA);
    const playPause = getCommandFromCommandList(commands, PLAY_PAUSE);
    const increaseSpeed = getCommandFromCommandList(commands, INCREASE_SPEED);
    const decreaseSpeed = getCommandFromCommandList(commands, DECREASE_SPEED);
    const skip5s = getCommandFromCommandList(commands, SKIP_5S);
    const back5s = getCommandFromCommandList(commands, BACK_5S);

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
        element: document.getElementById(capture.id),
        intro: `Click on the Notion doc to focus. Try capturing a screenshot by entering ${capture.getDisplayedCmd()}`,
        onchange: () => {
          this.skipStepIfMatchCmd(capture);
        },
      },
      {
        element: document.getElementById(showHideArea.id),
        intro: `Wonderful! Now try showing the capture area by entering ${showHideArea.getDisplayedCmd()}`,
        onchange: () => {
          this.skipStepIfMatchCmd(showHideArea);
        },
      },
      {
        intro:
          'See the blue box on the left window? Resize the capture area by dragging its borders',
      },
      {
        element: document.getElementById(capture.id),
        intro: `Try capturing a screenshot again by entering ${capture.getDisplayedCmd()}`,
        onchange: () => {
          this.skipStepIfMatchCmd(capture);
        },
      },
      {
        element: document.getElementById(showHideArea.id),
        intro: `Awesome! Now try hiding the capture area by entering ${showHideArea.getDisplayedCmd()}`,
        onchange: () => {
          this.skipStepIfMatchCmd(showHideArea);
        },
      },
      {
        element: document.getElementById(capture.id),
        intro:
          'When you try capturing a screenshot again the same capture area would be captured',
        onchange: () => {
          this.skipStepIfMatchCmd(capture);
        },
      },
      {
        element: document.getElementById(playPause.id),
        intro: `Try pausing the video by entering ${playPause.getDisplayedCmd()}`,
        onchange: () => {
          this.skipStepIfMatchCmd(playPause);
        },
      },
      {
        element: document.getElementById(playPause.id),
        intro: `Try playing the video by entering ${playPause.getDisplayedCmd()}`,
        onchange: () => {
          this.skipStepIfMatchCmd(playPause);
        },
      },
      {
        element: document.getElementById(increaseSpeed.id),
        intro: `Try increasing the video speed by entering ${increaseSpeed.getDisplayedCmd()}`,
        onchange: () => {
          this.skipStepIfMatchCmd(increaseSpeed);
        },
      },
      {
        element: document.getElementById(decreaseSpeed.id),
        intro: `Try decreasing the video speed by entering ${decreaseSpeed.getDisplayedCmd()}`,
        onchange: () => {
          this.skipStepIfMatchCmd(decreaseSpeed);
        },
      },
      {
        element: document.getElementById(skip5s.id),
        intro: `Try skip 5s of the video by entering ${skip5s.getDisplayedCmd()}`,
        onchange: () => {
          this.skipStepIfMatchCmd(skip5s);
        },
      },
      {
        element: document.getElementById(back5s.id),
        intro: `Try go back 5s of the video by entering ${back5s.getDisplayedCmd()}`,
        onchange: () => {
          this.skipStepIfMatchCmd(back5s);
        },
      },
      {
        element: document.getElementById(EDIT_KEYBOARD_SHORTCUT_BUTTON_ID),
        intro:
          'If you want to edit the keyboard shorcuts, click "Edit shortcuts"',
      },
      {
        element: document.getElementById(TUTORIAL_BUTTON_ID),
        intro:
          'That\'s all 🎉. If you need to go through the tutorial again, just click "Tutorial"',
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
 * @param {Command} command
 * @param {number} activeWindowID
 */
const handleCommand = (command, activeWindowID) => {
  const actionHandlers = {
    CAPTURE: async () => {
      flashHighlightElement(document.getElementById(command.id));

      const dataURI = await takeScreenshot(activeWindowID);
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
    },
    PLAY_PAUSE: async () => {
      flashHighlightElement(document.getElementById(command.id));

      await chromeSendRuntimeMessage({
        action: PLAY_PAUSE_VIDEO,
        activeWindowID,
      });
    },
    SHOW_HIDE_AREA: async () => {
      flashHighlightElement(document.getElementById(command.id));

      await chromeSendRuntimeMessage({
        action: TOGGLE_SHOW_HIDE_CAPTURE_AREA,
        activeWindowID,
      });
    },
    SKIP_5S: async () => {
      flashHighlightElement(document.getElementById(command.id));

      await chromeSendRuntimeMessage({
        action: SKIP_5S,
        activeWindowID,
      });
    },
    BACK_5S: async () => {
      flashHighlightElement(document.getElementById(command.id));

      await chromeSendRuntimeMessage({
        action: BACK_5S,
        activeWindowID,
      });
    },
    INCREASE_SPEED: async () => {
      flashHighlightElement(document.getElementById(command.id));

      await chromeSendRuntimeMessage({
        action: INCREASE_SPEED,
        activeWindowID,
      });
    },
    DECREASE_SPEED: async () => {
      flashHighlightElement(document.getElementById(command.id));

      await chromeSendRuntimeMessage({
        action: DECREASE_SPEED,
        activeWindowID,
      });
    },
  };

  if (actionHandlers[command.action]) {
    actionHandlers[command.action]();
  }
};

/**
 *
 * @param {string} activeWindowID to call actions on
 */
const handleKeyDown = async (commands, activeWindowID) => {
  try {
    commands.forEach((command) => {
      commandsTrap.update(command, activeWindowID);
    });
  } catch (err) {
    sendAlert(NOTION_ERR_MESSAGE);
    chrome.storage.local.clear();
    throw err;
  }
};

/**
 * Singleton class
 */
class UsageHint {
  constructor(usageHintsElement) {
    this.usageHintsElement = usageHintsElement;
  }

  /**
   *
   * @param {Command[]} commands
   * @param {number} activeWindowID
   */
  static createUsageHintButtons(commands, activeWindowID) {
    const container = htmlStringToElement(`
  <div class="usage-hint__button-container">
    <div id="${TUTORIAL_BUTTON_ID}" class="usage-hint__button" title="Show tutorial">
      <span>Tutorial</span>
      <svg id="tutorial-button-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
        <path d="M0 0h24v24H0V0z" fill="none"></path><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"></path>
      </svg>
    </div>
    <div id="${EDIT_KEYBOARD_SHORTCUT_BUTTON_ID}" class="usage-hint__button" data-micromodal-trigger="${EDIT_KEYBOARD_SHORTCUTS_MODAL_ID}">
      Edit shortcuts
    </div>
  </div>
`);

    container
      .querySelector(`#${TUTORIAL_BUTTON_ID}`)
      .addEventListener('click', () => {
        tutorial.show(commands, activeWindowID);
      });

    return container;
  }

  static get COMMAND_CONTAINER() {
    return 'command-container';
  }

  static init() {
    addCustomStyles(`
  .usage-hint {
    position: absolute;
    bottom: 16px;
    right: 18px;
    padding: 0 12px;
    padding-top: 4px;
    padding-bottom: 6px;
    background: white;
    width: 223px;
    color: ${NOTION_BLACK};
    box-shadow: rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px;
    border-radius: 3px;
    z-index: 101;
    font-size: 14px;
    cursor: default;
  }

  .usage-hint > .close-button {
    position: absolute;
    background: white;
    right: -8px;
    top: -7px;
    border-radius: 100%;
    border: solid 1px rgb(55, 53, 47);
    width: 18px;
    height: 18px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .usage-hint > .close-button:hover {
    background: rgb(242 242 242);
  }

  .usage-hint > .close-button > svg {
    width: 90%;
    fill: rgb(55, 53, 47);
  }

  .usage-hint__button-container {
    display: flex;
    justify-content: space-between;
    padding-bottom: 3px;
  }

  .usage-hint__button {
    border-radius: 4px;
    cursor: pointer;
    padding: 0 5px;
    display: inline-flex;
    align-items: center;
  }

  .usage-hint__button:hover {
    background: rgba(55, 53, 47, 0.08);
  }

  #${TUTORIAL_BUTTON_ID} {
    margin-left: -5px;
  }

  #tutorial-button-icon {
    width: 15px;
    margin-left: 2px;
    fill: ${NOTION_BLACK};
  }

  #${EDIT_KEYBOARD_SHORTCUT_BUTTON_ID} {
    margin-right: -5px;
  }

  .command-container {
    width: 100%;
    margin-bottom: 6px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
  }

  .command-container:last-child {
    margin-bottom: 0px;
  }

  .command-label {
    margin-right: 7px;
    color: rgba(55, 53, 47, 0.6);    
  }

  .command-cmd {
    color: rgb(175, 175, 175);
    font-family: SFMono-Regular, Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace;
    font-size: 90%;
    line-height: normal;
  }

  .show-usage-hint-button {
    user-select: none;
    transition: opacity 700ms ease 0s, color 700ms ease 0s, transform 200ms ease 0s;
    cursor: pointer;
    opacity: 1;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    bottom: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    border-radius: 100%;
    font-size: 20px;
    box-shadow: rgb(15 15 15 / 10%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 2px 4px;
    z-index: 101;
    transform: translateX(0px) translateZ(0px);
    visibility: visible;
  }

  .show-usage-hint-button:hover {
    background-color: rgb(239, 239, 238);
  }

  .show-usage-hint-button > svg {
    fill: rgb(55, 53, 47);
  }

  /* Hide notion help button */
  .notion-help-button {
    display: none !important;
  }

  ${
  isDarkMode()
    ? `
    .usage-hint {
      color: white;
      background: rgb(63, 68, 71);
      box-shadow: rgb(15 15 15 / 10%) 0px 0px 0px 1px, rgb(15 15 15 / 20%) 0px 3px 6px, rgb(15 15 15 / 40%) 0px 9px 24px;
    }

    .usage-hint > .close-button {
      background: rgb(80, 85, 88);
      border-color: white;
    }

    .usage-hint > .close-button:hover {
      background: rgb(98, 102, 104);
    }
  
    .usage-hint > .close-button > svg {
      fill: white;
    }

    .usage-hint__button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .show-usage-hint-button {
      background: rgb(80, 85, 88);
      box-shadow: rgb(15 15 15 / 20%) 0px 0px 0px 1px, rgb(15 15 15 / 20%) 0px 2px 4px;
    }

    .show-usage-hint-button:hover {
      background: rgb(98, 102, 104);
    }
  
    .show-usage-hint-button > svg {
      fill: white;
    }
    
     #tutorial-button-icon {
       fill: white;
     }

    .command-label {
      color: rgba(255, 255, 255, 0.8);
    }

    .command-cmd {
      color: rgba(255, 255, 255, 0.9);
    }
  `
    : ''
}
`);

    const showUsageHintsElement = htmlStringToElement(`
      <div class="show-usage-hint-button">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14l-6-6z"></path></svg>
      </div>
    `);
    showUsageHintsElement.style.visibility = 'hidden';
    showUsageHintsElement.addEventListener('click', () => {
      showUsageHintsElement.style.visibility = 'hidden';
      usageHintsElement.style.visibility = 'visible';
    });
    getBodyElement().appendChild(showUsageHintsElement);

    const usageHintsElement = htmlStringToElement(`
    <div id="${USAGE_HINT_CONTAINER_ID}" class="usage-hint">
      <div class="close-button" title="Hide usage hints">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
      </div>
    </div>
  `);
    usageHintsElement
      .querySelector('.close-button')
      .addEventListener('click', () => {
        usageHintsElement.style.visibility = 'hidden';
        showUsageHintsElement.style.visibility = 'visible';
      });

    return new UsageHint(usageHintsElement);
  }

  /**
   *
   * @param {Command} command
   */
  static renderCommand(command) {
    const childContainer = document.createElement('div');
    childContainer.id = command.id;
    childContainer.className = UsageHint.COMMAND_CONTAINER;

    const labelElement = document.createElement('span');
    labelElement.textContent = command.label;
    labelElement.className = 'command-label';

    const cmdElement = document.createElement('span');
    cmdElement.textContent = command.getDisplayedCmd();
    cmdElement.className = 'command-cmd';

    childContainer.appendChild(labelElement);
    childContainer.appendChild(cmdElement);
    return childContainer;
  }

  setup(commands, activeWindowID) {
    const bodyElement = getBodyElement();

    // Add usage hint buttons
    this.usageHintsElement.appendChild(
      UsageHint.createUsageHintButtons(commands, activeWindowID),
    );
    // Add usage hints label, text & id
    commands.forEach((command) => {
      this.usageHintsElement.appendChild(UsageHint.renderCommand(command));
    });

    bodyElement.appendChild(this.usageHintsElement);
  }

  /**
   *
   * @param {Command[]} commands
   */
  update(commands) {
    // Remove all command containers
    removeElementsByClassFromParent(
      this.usageHintsElement,
      UsageHint.COMMAND_CONTAINER,
    );

    commands.forEach((command) => {
      this.usageHintsElement.appendChild(UsageHint.renderCommand(command));
    });
  }
}

const usageHint = UsageHint.init();

/**
 * Singleton class
 */
class KeyboardShortcutsModal {
  static get CMD_SHORTCUT() {
    return 'cmd-shortcut';
  }

  static get CMD_SHORTCUT_EDIT() {
    return 'cmd-shortcut-edit';
  }

  static get CMD_SHORTCUT_DISPLAY() {
    return 'cmd-shortcut-display';
  }

  static get CMD_ACTION() {
    return 'cmd-action';
  }

  /**
   *
   * @param {HTMLDivElement} modalElement
   */
  constructor(modalElement) {
    this.modalElement = modalElement;
  }

  static init() {
    addCustomStyles(`
    #${EDIT_KEYBOARD_SHORTCUTS_MODAL_ID} {
      display: none;
      opacity: 0;
    }
    
    #${EDIT_KEYBOARD_SHORTCUTS_MODAL_ID}.is-open {
      display: block;
      opacity: 1;
    }

    .modal-overlay {
      z-index: 999;
      width: 100vw;
      height: 100vh;
      position: fixed;
      align-items: center;
      justify-content: center;
      opacity: 1;
      inset: 0px;
      background: rgba(15, 15, 15, 0.6);
      transform: translateZ(0px);
      pointer-events: auto;
      transition: opacity 0.2s;
    }

    .modal-container {
      position: fixed;
      top: 0px;
      left: 0px;
      display: flex;
      align-items: center;
      width: 100vw;
      height: 100vh;
      justify-content: center;
      pointer-events: auto;
      opacity: 1;
      transform: translateZ(0px);
    }

    .modal-box {
      position: relative;
      z-index: 1;
      box-shadow: rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 5px 10px, rgb(15 15 15 / 20%) 0px 15px 40px;
      border-radius: 3px;
      background: white;
      margin-bottom: 0px;
      width: 580px;
      height: 460px;
      max-width: calc(100vw - 100px);
      max-height: calc(100vh - 100px);
      overflow: hidden;
      display: flex;
      align-items: center;
      flex-direction: column;
    }

    .modal-content {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      height: 94%;
      width: 500px;
    }

    .modal-heading {
      width: 100%;
    }

    .modal-table {
      display: grid;
      grid-template-columns: 1fr 1.7fr;
      width: 100%;
      border: 1px solid rgb(233, 233, 231);
      grid-gap: 1px;
      font-size: 14px;
      background-color: rgb(233, 233, 231);  
    }

    .modal-table > .modal-table-heading {
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0px;
      padding-bottom: 4px;
    }

    .modal-table-heading > .command-header {
      height: 28px;
      display: inline-flex;
      align-items: center;
    }

    .reset-button {
      user-select: none;
      transition: background 20ms ease-in 0s;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      border-radius: 3px;
      height: 28px;
      padding: 0px 12px;
      font-size: 14px;
      line-height: 1.2;
      border: 1px solid rgba(55, 53, 47, 0.16);
      margin-top: 8px;
      margin-bottom: 4px;
      font-weight: 400;
    }

    .reset-button:hover {
      background: rgb(225, 225, 225);
    }

    .modal-table > .${KeyboardShortcutsModal.CMD_SHORTCUT} {
      position: relative;
      color: rgb(136 136 136);;
      font-family: SFMono-Regular, Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace;
      font-size: 90%;
      cursor: pointer;
      display: inline-flex;
      justify-content: space-between;
    }

    
    .modal-table > .${KeyboardShortcutsModal.CMD_SHORTCUT} > .${KeyboardShortcutsModal.CMD_SHORTCUT_EDIT} {
      opacity: 0;
    }
    
    .modal-table > .${KeyboardShortcutsModal.CMD_SHORTCUT}:nth-child(4) > .${KeyboardShortcutsModal.CMD_SHORTCUT_EDIT} {
      opacity: 1;
    }

    .modal-table > .${KeyboardShortcutsModal.CMD_SHORTCUT}:hover > .${KeyboardShortcutsModal.CMD_SHORTCUT_EDIT} {
      opacity: 1;
    }

    .modal-table > div {
      background-color: white;
      padding: 12px;
      text-align: left;
    }

  `);

    const modalElement = htmlStringToElement(`
  <div id="${EDIT_KEYBOARD_SHORTCUTS_MODAL_ID}" aria-hidden="true">
    <div class="modal-overlay" tabindex="-1" data-micromodal-close="${EDIT_KEYBOARD_SHORTCUTS_MODAL_ID}">
      <div class="modal-container" aria-modal="true" >
        <div class="modal-box">
          <div class="modal-content">
            <h3 class="modal-heading">Edit shortcuts</h3>
            <div class="modal-table">
              <div class="modal-table-heading">
                <div class="command-header">Command</div>
              </div>
              <div class="modal-table-heading">
                <div>Keyboard Shortcut</div>
                <div class="reset-button">Reset</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `);

    getBodyElement().appendChild(modalElement);

    return new KeyboardShortcutsModal(modalElement);
  }

  get tableElement() {
    return this.modalElement.querySelector('.modal-table');
  }

  /**
   *
   * @param {Element} displayedCommandElement
   * @param {Element} editHintElement
   * @param {Command[]} command
   * @param {Command} command
   * @param {number} activeWindowID
   */
  static recordCommand(
    displayedCommandElement,
    editHintElement,
    commands,
    command,
    activeWindowID,
  ) {
    // Visual feedback to show pending
    const visualPending = () => {
      displayedCommandElement.textContent = 'Type your command';
      editHintElement.style.visibility = 'hidden';
    };

    // Visual feedback to show done
    const visualDone = () => {
      displayedCommandElement.textContent = command.getDisplayedCmd();
      editHintElement.style.visibility = 'visible';
    };

    commandsTrap.pause();
    commandsTrap.unbind(command.cmd);
    visualPending();

    const recorderTrap = new Mousetrap(document.documentElement);
    recorderTrap.record((sequence) => {
      command.setCmd(sequence[0]);
      visualDone();
      commandsTrap.update(command, activeWindowID);
      updateCommandsStorage(commands);
      usageHint.update(commands);
      commandsTrap.unpause();
    });
  }

  /**
   * Reset commands to default commands
   *
   * @param {Command[]} oldCommands
   * @param {number} activeWindowID
   */
  resetCommands(oldCommands, activeWindowID) {
    commandsTrap.pause();

    oldCommands.forEach((oldCommand) => {
      commandsTrap.unbind(oldCommand.cmd);
    });
    const defaultCommands = constructCommandsList(defaultCommandsJson);
    defaultCommands.forEach((command) => {
      commandsTrap.update(command, activeWindowID);
    });
    updateCommandsStorage(defaultCommands);
    usageHint.update(defaultCommands);

    // Remove old rows and render new ones
    removeElementsByClassFromParent(
      this.modalElement,
      KeyboardShortcutsModal.CMD_ACTION,
    );
    removeElementsByClassFromParent(
      this.modalElement,
      KeyboardShortcutsModal.CMD_SHORTCUT,
    );
    this.renderCommands(defaultCommands, activeWindowID);

    commandsTrap.unpause();
  }

  /**
   * Renders commands in table
   *
   * @param {Command[]} commands
   * @param {number} activeWindowID
   */
  renderCommands(commands, activeWindowID) {
    commands.forEach((command) => {
      const cmdElement = htmlStringToElement(`
        <div class="${KeyboardShortcutsModal.CMD_SHORTCUT}">
          <span class="${
  KeyboardShortcutsModal.CMD_SHORTCUT_DISPLAY
}">${command.getDisplayedCmd()}</span>
          <span class="${
  KeyboardShortcutsModal.CMD_SHORTCUT_EDIT
}">(Click to edit)</span>
        </div>
      `);

      cmdElement.onclick = () => {
        KeyboardShortcutsModal.recordCommand(
          cmdElement.querySelector(
            `.${KeyboardShortcutsModal.CMD_SHORTCUT_DISPLAY}`,
          ),
          cmdElement.querySelector(
            `.${KeyboardShortcutsModal.CMD_SHORTCUT_EDIT}`,
          ),
          commands,
          command,
          activeWindowID,
        );
      };

      this.tableElement.appendChild(
        htmlStringToElement(
          `<div class="${KeyboardShortcutsModal.CMD_ACTION}">${command.label}</div>`,
        ),
      );
      this.tableElement.appendChild(cmdElement);
    });
  }

  /**
   *
   * @param {Command[]} commands
   * @param {number} activeWindowID
   */
  setup(commands, activeWindowID) {
    // Initialise micromodal
    // https://micromodal.vercel.app/
    // Must be called only after data-micromodal-trigger is set
    MicroModal.init();

    this.modalElement
      .querySelector('.reset-button')
      .addEventListener('click', () => {
        this.resetCommands(commands, activeWindowID);
      });
    this.renderCommands(commands, activeWindowID);
  }
}

const keyboardShortcutsModal = KeyboardShortcutsModal.init();

const addListener = async () => {
  try {
    const { activeWindowID, hasShownTutorial } = await getLocalStorageData([
      'activeWindowID',
      'hasShownTutorial',
    ]);
    const commands = await getCommands();

    handleKeyDown(commands, activeWindowID);
    usageHint.setup(commands, activeWindowID);
    keyboardShortcutsModal.setup(commands, activeWindowID);
    if (!hasShownTutorial) {
      tutorial.show(commands, activeWindowID);
      await setLocalStorageData({ hasShownTutorial: true });
    }
  } catch (err) {
    sendAlert(NOTION_ERR_MESSAGE);
    throw err;
  }
};

/**
 *
 * @param {string} url
 * @returns {boolean}
 *
 * @example
 * https://www.notion.so/rizhaow/714aa33daf4f4decb637053e9c9341ab returns true
 * https://www.notion.so/ returns fakse
 */
const isNotionPageUrl = (url) => {
  const urlPaths = url.split('/');

  return url.includes(NOTION_URL) && urlPaths[urlPaths.length - 1].length >= 32;
};

/**
 *
 * @returns {(url: string) => void} A func that add listener if current url is notion page url.
 * Listener is only added the first time.
 */
const initAddListenerIfMatchNotionPageUrl = () => {
  let isInit = false;
  return (url) => {
    if (!isInit && isNotionPageUrl(url)) {
      addListener();
      isInit = true;
    }
  };
};

/**
 * Init notion content script when enter notion page
 * Initialisation is done only one
 * Note: Cannot just do matching in manifest
 * Reference: https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes
 */
const main = () => {
  const addListenerIfMatchNotionPageUrl = initAddListenerIfMatchNotionPageUrl();
  let oldHref = window.location.href;

  addListenerIfMatchNotionPageUrl(window.location.href);

  window.onload = () => {
    const bodyList = document.querySelector('body');

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        if (oldHref !== window.location.href) {
          oldHref = window.location.href;
          addListenerIfMatchNotionPageUrl(window.location.href);
        }
      });
    });

    const config = {
      childList: true,
      subtree: true,
    };

    observer.observe(bodyList, config);
  };
};

main();
