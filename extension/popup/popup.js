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
    currentWindow: false,
    url: `${NOTION_URL}/*`,
  });

  if (tabs.length > 0) {
    const notionTab = tabs[0];
    await chrome.windows.update(notionTab.windowId, {
      left: width,
      width,
      focused: true,
    });
  } else {
    await chrome.windows.create({
      url: NOTION_URL,
      left: width,
      width: width,
    });
  }
};

const handleSeparateWindow = async (activeTab) => {
  const { screenWidth } = await chromeSendRuntimeMessage({
    action: GET_SCREEN_WIDTH,
    tabID: activeTab.id,
  });
  const halfWidth = Math.floor(screenWidth / 2);

  await chrome.windows.update(activeTab.windowId, {
    width: halfWidth,
  });

  await resizeOrCreateNotionWindow(halfWidth);

  await chromeSendRuntimeMessage({
    action: SHOW_ACTIVE_VIDEO,
    tabID: activeTab.id,
  });
};

const handleTakeNotes = async (event) => {
  const tabs = await getActiveTabs();
  const activeTab = tabs[0];

  await setLocalStorageData({
    videoURL: activeTab.url,
    activeTabID: activeTab.id,
  });
  // if (isYoutubeOrVimeo(activeTab.url)) {
  //   chrome.tabs.create({ url: NOTION_URL });
  // } else {
  await handleSeparateWindow(activeTab);
  // }

  window.close();
};

const main = () => {
  document
    .getElementById('take-notes-button')
    .addEventListener('click', (event) => handleTakeNotes(event));
};

main();
