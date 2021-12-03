const getActiveTabs = () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      chromeCallbackHandler(resolve, reject)
    );
  });
};

const handleTakeNotes = async (event) => {
  const tabs = await getActiveTabs();
  const activeTab = tabs[0];

  await setLocalStorageData({
    videoURL: activeTab.url,
    activeTabID: activeTab.id,
  });
  if (isYoutubeOrVimeo(activeTab.url)) {
    chrome.tabs.create({ url: NOTION_URL });
  } else {
    chrome.windows.create({ url: NOTION_URL });
    await chromeSendRuntimeMessage({
      action: SHOW_ACTIVE_VIDEO,
      tabID: activeTab.id,
    });
  }

  window.close();
};

const main = () => {
  document
    .getElementById('take-notes-button')
    .addEventListener('click', (event) => handleTakeNotes(event));
};

main();
