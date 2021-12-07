const getActiveTabs = () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      chromeCallbackHandler(resolve, reject)
    );
  });
};

/**
 * Resize notion window if it exist, else create a new notion window
 * Ensures that there is always only one notion window
 * STATUS: Commented out resize
 * @param {number} width
 */
const resizeOrCreateNotionWindow = async (width) => {
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
    width: width,
  });
};

const handleSeparateWindow = async (activeTab) => {
  try {
    const { screenWidth } = await chromeSendRuntimeMessage({
      action: GET_SCREEN_WIDTH,
      tabID: activeTab.id,
    });
    const halfWidth = Math.floor(screenWidth / 2);

    await chrome.windows.update(activeTab.windowId, {
      width: halfWidth,
    });

    await resizeOrCreateNotionWindow(halfWidth);
  } catch (err) {
    throw new Error('Failed to create separate window');
  }
};

const handleTakeNotes = async (event) => {
  try {
    const tabs = await getActiveTabs();
    const activeTab = tabs[0];
    const activeWindowID = activeTab.windowId;

    await setLocalStorageData({
      videoURL: activeTab.url,
      activeWindowID: activeTab.windowId,
    });

    await handleSeparateWindow(activeTab);
    window.close();
  } catch (err) {
    sendAlert(NOTION_ERR_MESSAGE);
    console.error(err.message);
    chrome.storage.local.clear();
  }
};

const main = () => {
  document.getElementById('feedback-button').href = FEEDBACK_URL;
  document
    .getElementById('take-notes-button')
    .addEventListener('click', (event) => handleTakeNotes(event));
};

main();
