const NOTION_URL = 'https://www.notion.so';

// Actions
const LOAD_VIDEO_IFRAME = 'LOAD_VIDEO_IFRAME';

const isYoutubeOrVimeo = () =>
  window.location.href.includes('youtube.com') ||
  window.location.href.includes('vimeo.com');

const handleTakeNotes = (event) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    const data = { videoURL: activeTab.url, activeTabID: activeTab.id };
    chrome.storage.local.set(data, () => {
      if (isYoutubeOrVimeo()) {
        // Open notion.so with video url of youtube/vimeo loaded as iframe
        // Used to pass message to content.js
        chrome.tabs.create({ url: NOTION_URL });
        window.close();
      } else {
        // Create new notion window
        // Doing this instead of passing to iframe since we can't create iFrame with the video URL
        chrome.windows.create({ url: NOTION_URL });
        window.close();
      }
    });
  });
};

const main = () => {
  document
    .getElementById('take-notes-button')
    .addEventListener('click', handleTakeNotes);
};

main();
