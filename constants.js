/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const NOTION_URL = 'https://www.notion.so';

const TAKE_SCREEN_SHOT = 'TAKE_SCREEN_SHOT';
const GET_VIDEO_POSITION_DATA = 'GET_VIDEO_POSITION_DATA';
const DISABLE_CAPTURE_AREA = 'DISABLE_CAPTURE_AREA';
const TOGGLE_SHOW_HIDE_CAPTURE_AREA = 'TOGGLE_SHOW_HIDE_CAPTURE_AREA';
const SKIP_5S = 'SKIP_5S';
const BACK_5S = 'BACK_5S';
const INCREASE_SPEED = 'INCREASE_SPEED';
const DECREASE_SPEED = 'DECREASE_SPEED';
// Get screen width (screen width should only be obtained from content script not popup)
const GET_SCREEN_DIMENSIONS = 'GET_SCREEN_DIMENSIONS';
const SHOW_CAPTURE_AREA_IF_NO_VIDEO = 'SHOW_CAPTURE_AREA_IF_NO_VIDEO';
const PLAY_PAUSE_VIDEO = 'PLAY_PAUSE_VIDEO';

const NOTION_ERR_MESSAGE = `Error 😢. Try 
  1️⃣ Refresh the video window
  2️⃣ Start a new notetaking session`;

const CAPTURE_AREA_ID = 'capture-area';
const HOW_TO_USE_URL = 'https://www.youtube.com/watch?v=n-FfbX9zhdw';
const FEEDBACK_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdq6KtGZKvPLN2KBaxyw3D37PidA9EBFAfYUtaR7Vq8mGuZdQ/viewform?usp=sf_link';
const REVIEW_URL = 'https://chrome.google.com/webstore/detail/sidenotion/ihjmeedcmbeapmaagcjpngemnckiooih/reviews';

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const USAGE_HINT_CONTAINER_ID = 'usage-hint-container';

const cmdKey = isMac ? 'cmd' : 'ctrl';

// Commands

const CAPTURE_CMD = `${cmdKey}+shift+,`;
const CAPTURE_CODE = 'Comma';
const CAPTURE_KEY = ',';
const CAPTURE_HINT_ID = 'capture-hint';

const PLAY_PAUSE_CMD = `${cmdKey}+shift+␣`;
const PLAY_PAUSE_CODE = 'Space';
const PLAY_PAUSE_KEY = ' ';
const PLAY_PAUSE_HINT_ID = 'play-pause-hint';

const SHOW_HIDE_AREA_CMD = `${cmdKey}+shift+k`;
const SHOW_HIDE_AREA_CODE = 'KeyK';
const SHOW_HIDE_AREA_KEY = 'k';
const SHOW_HIDE_AREA_HINT_ID = 'toggle-capture-area-hint';

const SHOW_TUTORIAL_CMD = `${cmdKey}+shift+'`;
const SHOW_TUTORIAL_CODE = 'Quote';
const SHOW_TUTORIAL_KEY = "'";
const SHOW_TUTORIAL_HINT_ID = 'tutorial-hint';

const SKIP_5S_CMD = `${cmdKey}+shift+9`;
const SKIP_5S_CODE = 'Digit9';
const SKIP_5S_KEY = '9';
const SKIP_5S_HINT_ID = 'skip-5s-hint';

const BACK_5S_CMD = `${cmdKey}+shift+8`;
const BACK_5S_CODE = 'Digit8';
const BACK_5S_KEY = '8';
const BACK_5S_HINT_ID = 'back-5s-hint';

const INCREASE_SPEED_CMD = `${cmdKey}+shift+0`;
const INCREASE_SPEED_CODE = 'Digit0';
const INCREASE_SPEED_KEY = '0';
const INCREASE_SPEED_HINT_ID = 'increase-speed-hint';

const DECREASE_SPEED_CMD = `${cmdKey}+shift+7`;
const DECREASE_SPEED_CODE = 'Digit7';
const DECREASE_SPEED_KEY = '7';
const DECREASE_SPEED_HINT_ID = 'decrease-speed-hint';
