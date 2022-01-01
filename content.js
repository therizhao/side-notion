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
        element: document.getElementById(TUTORIAL_BUTTON_ID),
        intro:
          "That's all 🎉. If you need to go through the tutorial again, just click the tutorial button",
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
 *
 * @param {Command[]} commands
 * @param {number} activeWindowID
 */
const createUsageHintButtons = (commands, activeWindowID) => {
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
};

/**
 * Singleton class
 */
class UsageHint {
  constructor(usageHintsElement) {
    this.usageHintsElement = usageHintsElement;
  }

  static get COMMAND_CONTAINER() {
    return 'command-container';
  }

  static init() {
    const bodyElement = getBodyElement();
    addCustomStyles(`
  .usage-hint {
    position: absolute;
    bottom: 16px;
    right: 16px;
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

  ${
  bodyElement.classList.contains('dark')
    ? `
    .usage-hint {
      background: rgb(63, 68, 71);
      box-shadow: rgb(15 15 15 / 10%) 0px 0px 0px 1px, rgb(15 15 15 / 20%) 0px 3px 6px, rgb(15 15 15 / 40%) 0px 9px 24px;
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

    const usageHintsElement = document.createElement('div');
    usageHintsElement.id = USAGE_HINT_CONTAINER_ID;
    usageHintsElement.className = 'usage-hint';

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

  show(commands, activeWindowID) {
    const bodyElement = getBodyElement();

    // Add usage hint buttons
    this.usageHintsElement.appendChild(
      createUsageHintButtons(commands, activeWindowID),
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
    removeElementsByClass(UsageHint.COMMAND_CONTAINER);

    commands.forEach((command) => {
      this.usageHintsElement.appendChild(UsageHint.renderCommand(command));
    });
  }
}

const usageHint = UsageHint.init();

// /**
//  *
//  * @param {Command[]} commands
//  * @param {number} activeWindowID
//  */
// const showUsageHint = (commands, activeWindowID) => {
//   /**
//    *
//    * @param {Command} command
//    */
//   const renderChild = (command) => {
//     const childContainer = document.createElement('div');
//     childContainer.id = command.id;
//     childContainer.className = 'command-container';

//     const labelElement = document.createElement('span');
//     labelElement.textContent = command.label;
//     labelElement.className = 'command-label';

//     const cmdElement = document.createElement('span');
//     cmdElement.textContent = command.getDisplayedCmd();
//     cmdElement.className = 'command-cmd';

//     childContainer.appendChild(labelElement);
//     childContainer.appendChild(cmdElement);
//     return childContainer;
//   };

//   const bodyElement = getBodyElement();
//   addCustomStyles(`
//     .usage-hint {
//       position: absolute;
//       bottom: 16px;
//       right: 16px;
//       padding: 0 12px;
//       padding-top: 4px;
//       padding-bottom: 6px;
//       background: white;
//       width: 223px;
//       color: ${NOTION_BLACK};
//       box-shadow: rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px;
//       border-radius: 3px;
//       z-index: 101;
//       font-size: 14px;
//       cursor: default;
//     }

//     .usage-hint__button-container {
//       display: flex;
//       justify-content: space-between;
//       padding-bottom: 3px;
//     }

//     .usage-hint__button {
//       border-radius: 4px;
//       cursor: pointer;
//       padding: 0 5px;
//       display: inline-flex;
//       align-items: center;
//     }

//     .usage-hint__button:hover {
//       background: rgba(55, 53, 47, 0.08);
//     }

//     #${TUTORIAL_BUTTON_ID} {
//       margin-left: -5px;
//     }

//     #tutorial-button-icon {
//       width: 15px;
//       margin-left: 2px;
//       fill: ${NOTION_BLACK};
//     }

//     #${EDIT_KEYBOARD_SHORTCUT_BUTTON_ID} {
//       margin-right: -5px;
//     }

//     .command-container {
//       width: 100%;
//       margin-bottom: 6px;
//       display: inline-flex;
//       justify-content: space-between;
//       align-items: center;
//     }

//     .command-container:last-child {
//       margin-bottom: 0px;
//     }

//     .command-label {
//       margin-right: 7px;
//       color: rgba(55, 53, 47, 0.6);
//     }

//     .command-cmd {
//       color: rgb(175, 175, 175);
//       font-family: SFMono-Regular, Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace;
//       font-size: 90%;
//       line-height: normal;
//     }

//     ${
//   bodyElement.classList.contains('dark')
//     ? `
//       .usage-hint {
//         background: rgb(63, 68, 71);
//         box-shadow: rgb(15 15 15 / 10%) 0px 0px 0px 1px, rgb(15 15 15 / 20%) 0px 3px 6px, rgb(15 15 15 / 40%) 0px 9px 24px;
//       }

//       .command-label {
//         color: rgba(255, 255, 255, 0.8);
//       }

//       .command-cmd {
//         color: rgba(255, 255, 255, 0.9);
//       }
//     `
//     : ''
// }
//   `);

//   const usageHintsElement = document.createElement('div');
//   usageHintsElement.id = USAGE_HINT_CONTAINER_ID;
//   usageHintsElement.className = 'usage-hint';

//   // Add usage hint buttons
//   usageHintsElement.appendChild(
//     createUsageHintButtons(commands, activeWindowID),
//   );
//   // Add usage hints label, text & id
//   commands.forEach((command) => {
//     usageHintsElement.appendChild(renderChild(command));
//   });

//   bodyElement.appendChild(usageHintsElement);
// };

/**
 * Singleton class
 */
class KeyboardShortcutsModal {
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
      width: 960px;
      max-width: calc(100vw - 100px);
      height: calc(100vh - 100px);
      overflow: hidden;
      display: flex;
      align-items: center;
      flex-direction: column;
      max-height: 695px;
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
    }

    .modal-table > .command {
      position: relative;
      color: rgb(136 136 136);;
      font-family: SFMono-Regular, Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace;
      font-size: 90%;
      cursor: pointer;
      display: inline-flex;
      justify-content: space-between;
    }

    
    .modal-table > .command > .edit-command {
      opacity: 0;
    }
    
    .modal-table > .command:nth-child(4) > .edit-command {
      opacity: 1;
    }

    .modal-table > .command:hover > .edit-command {
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
              <div class="modal-table-heading">Command</div>
              <div class="modal-table-heading">Keyboard Shortcut</div>
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
   *
   * @param {Command[]} commands
   * @param {number} activeWindowID
   */
  show(commands, activeWindowID) {
    MicroModal.init();
    commands.forEach((command) => {
      const cmdElement = htmlStringToElement(`
        <div class="command">
          <span class="display-command">${command.getDisplayedCmd()}</span>
          <span class="edit-command">(Click to edit)</span>
        </div>
      `);

      cmdElement.onclick = () => {
        KeyboardShortcutsModal.recordCommand(
          cmdElement.querySelector('.display-command'),
          cmdElement.querySelector('.edit-command'),
          commands,
          command,
          activeWindowID,
        );
      };

      this.tableElement.appendChild(
        htmlStringToElement(`<div>${command.label}</div>`),
      );
      this.tableElement.appendChild(cmdElement);
    });
  }
}

const keyboardShortcutsModal = KeyboardShortcutsModal.init();

// const addKeyboardShorcutsModal = (commands, activeWindowID) => {
//   addCustomStyles(`
//     #${EDIT_KEYBOARD_SHORTCUTS_MODAL_ID} {
//       display: none;
//       opacity: 0;
//     }

//     #${EDIT_KEYBOARD_SHORTCUTS_MODAL_ID}.is-open {
//       display: block;
//       opacity: 1;
//     }

//     .modal-overlay {
//       z-index: 999;
//       width: 100vw;
//       height: 100vh;
//       position: fixed;
//       align-items: center;
//       justify-content: center;
//       opacity: 1;
//       inset: 0px;
//       background: rgba(15, 15, 15, 0.6);
//       transform: translateZ(0px);
//       pointer-events: auto;
//       transition: opacity 0.2s;
//     }

//     .modal-container {
//       position: fixed;
//       top: 0px;
//       left: 0px;
//       display: flex;
//       align-items: center;
//       width: 100vw;
//       height: 100vh;
//       justify-content: center;
//       pointer-events: auto;
//       opacity: 1;
//       transform: translateZ(0px);
//     }

//     .modal-box {
//       position: relative;
//       z-index: 1;
//       box-shadow: rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 5px 10px, rgb(15 15 15 / 20%) 0px 15px 40px;
//       border-radius: 3px;
//       background: white;
//       margin-bottom: 0px;
//       width: 960px;
//       max-width: calc(100vw - 100px);
//       height: calc(100vh - 100px);
//       overflow: hidden;
//       display: flex;
//       align-items: center;
//       flex-direction: column;
//       max-height: 695px;
//     }

//     .modal-content {
//       display: flex;
//       justify-content: center;
//       align-items: center;
//       flex-direction: column;
//       height: 94%;
//       width: 500px;
//     }

//     .modal-heading {
//       width: 100%;
//     }

//     .modal-table {
//       display: grid;
//       grid-template-columns: 1fr 1.7fr;
//       width: 100%;
//       border: 1px solid rgb(233, 233, 231);
//       grid-gap: 1px;
//       font-size: 14px;
//       background-color: rgb(233, 233, 231);
//     }

//     .modal-table > .modal-table-heading {
//       font-weight: 600;
//     }

//     .modal-table > .command {
//       position: relative;
//       color: rgb(136 136 136);;
//       font-family: SFMono-Regular, Menlo, Consolas, "PT Mono", "Liberation Mono", Courier, monospace;
//       font-size: 90%;
//       cursor: pointer;
//       display: inline-flex;
//       justify-content: space-between;
//     }

//     .modal-table > .command > .edit-command {
//       opacity: 0;
//     }

//     .modal-table > .command:nth-child(4) > .edit-command {
//       opacity: 1;
//     }

//     .modal-table > .command:hover > .edit-command {
//       opacity: 1;
//     }

//     .modal-table > div {
//       background-color: white;
//       padding: 12px;
//       text-align: left;
//     }
//   `);

//   const modalElement = htmlStringToElement(`
//   <div id="${EDIT_KEYBOARD_SHORTCUTS_MODAL_ID}" aria-hidden="true">
//     <div class="modal-overlay" tabindex="-1" data-micromodal-close="${EDIT_KEYBOARD_SHORTCUTS_MODAL_ID}">
//       <div class="modal-container" aria-modal="true" >
//         <div class="modal-box">
//           <div class="modal-content">
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
//   `);

//   const tableElement = document.createElement('div');
//   tableElement.className = 'modal-table';

//   tableElement.appendChild(
//     htmlStringToElement(`
//     <div class="modal-table-heading">Command</div>
//   `),
//   );
//   tableElement.appendChild(
//     htmlStringToElement(`
//     <div class="modal-table-heading">Keyboard Shortcut</div>
//   `),
//   );

//   const resetCommands = () => {
//     commandsTrap.pause();
//     defaultCommands.forEach((command) => {
//       commandsTrap.update(command, activeWindowID);
//       // Update all the text
//     });
//     updateCommandsStorage(defaultCommands);
//     usageHint.update(defaultCommands);
//     commandsTrap.unpause();
//   };

//   commands.forEach(
//     /**
//      *
//      * @param {Command} command
//      */
//     (command) => {
//       const actionElement = document.createElement('div');
//       actionElement.textContent = command.label;
//       const cmdElement = document.createElement('div');
//       cmdElement.className = 'command';
//       const displayedCmd = htmlStringToElement(
//         `<span>${command.getDisplayedCmd()}</span>`,
//       );
//       cmdElement.appendChild(displayedCmd);

//       const editHint = htmlStringToElement(
//         '<span class="edit-command">(Click to edit)</span>',
//       );
//       cmdElement.appendChild(editHint);
//       cmdElement.onclick = () => {
//         // Records commnd
//         const recorderTrap = new Mousetrap(document.documentElement);
//         // Pause commands trap to prevent conflict
//         commandsTrap.pause();
//         // Remove old binding
//         commandsTrap.unbind(command.cmd);

//         // Hide edit hint
//         editHint.style.visibility = 'hidden';
//         displayedCmd.textContent = 'Type your command';

//         // Start recording
//         recorderTrap.record((sequence) => {
//           // Update command
//           command.setCmd(sequence[0]);
//           displayedCmd.textContent = command.getDisplayedCmd();
//           editHint.style.visibility = 'visible';

//           // Update commands trap
//           commandsTrap.update(command, activeWindowID);
//           // Update local storage
//           updateCommandsStorage(commands);
//           // Update usage hint
//           usageHint.update(commands);

//           // Unpause commands trap
//           commandsTrap.unpause();
//         });
//       };

//       tableElement.appendChild(actionElement);
//       tableElement.appendChild(cmdElement);
//     },
//   );

//   modalElement
//     .querySelector('.modal-content')
//     .appendChild(
//       htmlStringToElement('<h3 class="modal-heading">Edit shortcuts</h3>'),
//     );
//   modalElement.querySelector('.modal-content').appendChild(tableElement);

//   getBodyElement().appendChild(modalElement);
//   MicroModal.init();
// };

const addListener = async () => {
  try {
    const { activeWindowID, hasShownTutorial } = await getLocalStorageData([
      'activeWindowID',
      'hasShownTutorial',
    ]);
    const commands = await getCommands();

    handleKeyDown(commands, activeWindowID);
    usageHint.show(commands, activeWindowID);
    keyboardShortcutsModal.show(commands, activeWindowID);
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
