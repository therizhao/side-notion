const NOTION_URL = 'https://www.notion.so';

// Actions
const LOAD_VIDEO_IFRAME = 'LOAD_VIDEO_IFRAME';

const handleTakeNotes = (event) => {
  // Open notion.so with video url of youtube loaded as iframe
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    const videoURL = activeTab.url;
    chrome.storage.local.set({ videoURL }, () => {
      // Open notion after local storage has been set
      // Used to pass message to content.js
      chrome.tabs.create({ url: NOTION_URL });
      window.close();
    });
  });
};

const main = () => {
  document
    .getElementById('take-notes-button')
    .addEventListener('click', handleTakeNotes);
};

main();
