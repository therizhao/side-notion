/* eslint-disable no-unused-vars */
const NOTION_URL = 'https://www.notion.so';

const TAKE_SCREEN_SHOT = 'TAKE_SCREEN_SHOT';
const GET_VIDEO_POSITION_DATA = 'GET_VIDEO_POSITION_DATA';
const DISABLE_CAPTURE_AREA = 'DISABLE_CAPTURE_AREA';
const TOGGLE_SHOW_HIDE_CAPTURE_AREA = 'TOGGLE_SHOW_HIDE_CAPTURE_AREA';
// Get screen width (screen width should only be obtained from content script not popup)
const GET_SCREEN_DIMENSIONS = 'GET_SCREEN_DIMENSIONS';
const SHOW_CAPTURE_AREA_IF_NO_VIDEO = 'SHOW_CAPTURE_AREA_IF_NO_VIDEO';
const PLAY_PAUSE_VIDEO = 'PLAY_PAUSE_VIDEO';

const NOTION_ERR_MESSAGE = `Error 😢. Try 
  1️⃣ Refresh the video window
  2️⃣ Start a new notetaking session`;

const CAPTURE_AREA_ID = 'capture-area';
const HOW_TO_USE_URL = 'https://www.youtube.com/watch?v=VlyQVYS2Y20';
const FEEDBACK_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdq6KtGZKvPLN2KBaxyw3D37PidA9EBFAfYUtaR7Vq8mGuZdQ/viewform?usp=sf_link';
const REVIEW_URL = 'https://chrome.google.com/webstore/detail/sidenotion/ihjmeedcmbeapmaagcjpngemnckiooih/reviews';

const USAGE_HINT_CONTAINER_ID = 'usage-hint-container';
const PLAY_PAUSE_HINT_ID = 'play-pause-hint';
const CAPTURE_HINT_ID = 'capture-hint';
const SHOW_TUTORIAL_HINT_ID = 'tutorial-hint';
const SHOW_HIDE_AREA_HINT_ID = 'toggle-capture-area-hint';
