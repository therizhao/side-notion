/* eslint-disable no-console */
/* eslint-disable no-undef */
const getActiveTabs = () => new Promise((resolve, reject) => {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    chromeCallbackHandler(resolve, reject),
  );
});

const getActiveTab = async () => {
  const tabs = await getActiveTabs();
  return tabs[0];
};

/**
 * Remove all notion tabs and create new notion window
 * @param {number} width
 * @param {number} height
 */
const removeExistingAndCreateNotionWindow = async (width, height) => {
  // Get tabs with notion url that is not current window
  const tabs = await chrome.tabs.query({
    url: `${NOTION_URL}/*`,
  });

  if (tabs.length > 0) {
    await chrome.tabs.remove(tabs.map((tab) => tab.id));
  }

  await chrome.windows.create({
    url: NOTION_URL,
    left: width,
    state: 'normal',
    width,
    height,
  });
};

const handleSeparateWindow = async (activeTab) => {
  try {
    const { screenWidth, screenHeight } = await chromeSendRuntimeMessage({
      action: GET_SCREEN_DIMENSIONS,
      tabID: activeTab.id,
    });
    const halfWidth = Math.floor(screenWidth / 2);

    await removeExistingAndCreateNotionWindow(halfWidth, screenHeight);
    await chrome.windows.update(activeTab.windowId, {
      width: halfWidth,
      height: screenHeight,
      state: 'normal',
    });
  } catch (err) {
    throw new Error('Failed to create separate window');
  }
};

const handleTakeNotes = async (event, activeTab) => {
  try {
    await setLocalStorageData({
      videoURL: activeTab.url,
      activeWindowID: activeTab.windowId,
    });

    await handleSeparateWindow(activeTab);
    await chromeSendRuntimeMessage({
      action: SHOW_CAPTURE_AREA_IF_NO_VIDEO,
      tabID: activeTab.id,
    });
    window.close();
  } catch (err) {
    sendAlert(NOTION_ERR_MESSAGE);
    console.error(err.message);
    chrome.storage.local.clear();
  }
};

const disableTakesNotes = () => {
  const takeNotesButton = document.getElementById('take-notes-button');
  takeNotesButton.style.background = 'rgb(192 192 192)';

  const takesNotesButtonHint = document.createElement('p');
  takesNotesButtonHint.id = 'take-notes-button-hint';
  // Can show tutorial video here
  takesNotesButtonHint.textContent = 'Click the button only on a website where you want to take screenshots from';

  takeNotesButton.parentNode.insertBefore(takesNotesButtonHint, takeNotesButton.nextElementSibling);
};

const main = async () => {
  document.getElementById('how-to-use-button').href = HOW_TO_USE_URL;
  document.getElementById('feedback-button').href = FEEDBACK_URL;
  document.getElementById('rate-button').href = REVIEW_URL;

  const activeTab = await getActiveTab();
  if (activeTab.url.includes(NOTION_URL)) {
    disableTakesNotes();
    return;
  }

  document
    .getElementById('take-notes-button')
    .addEventListener('click', (event) => handleTakeNotes(event, activeTab));
};

main();
