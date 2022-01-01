/* eslint-disable no-undef */
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

const HOW_TO_USE_URL = 'https://www.youtube.com/watch?v=n-FfbX9zhdw';
const FEEDBACK_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdq6KtGZKvPLN2KBaxyw3D37PidA9EBFAfYUtaR7Vq8mGuZdQ/viewform?usp=sf_link';
const REVIEW_URL = 'https://chrome.google.com/webstore/detail/sidenotion/ihjmeedcmbeapmaagcjpngemnckiooih/reviews';

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

// Element IDs

const CAPTURE_AREA_ID = 'capture-area';
const EDIT_KEYBOARD_SHORTCUT_BUTTON_ID = 'edit-keyboard-shortcut-button';
const TUTORIAL_BUTTON_ID = 'tutorial_button';
const USAGE_HINT_CONTAINER_ID = 'usage-hint-container';
const EDIT_KEYBOARD_SHORTCUTS_MODAL_ID = 'edit-keyboard-shortcuts-modal';

// Colors

const NOTION_BLACK = 'rgb(55, 53, 47)';

// Actions

const CAPTURE = 'CAPTURE';
const PLAY_PAUSE = 'PLAY_PAUSE';
const SHOW_HIDE_AREA = 'SHOW_HIDE_AREA';
const SHOW_TUTORIAL = 'SHOW_TUTORIAL';
const SKIP_5S = 'SKIP_5S';
const BACK_5S = 'BACK_5S';
const INCREASE_SPEED = 'INCREASE_SPEED';
const DECREASE_SPEED = 'DECREASE_SPEED';

// Commands

const cmdKey = isMac ? 'cmd' : 'ctrl';

// Default commands
/**
 * https://craig.is/killing/mice
 * mod key
 * On Mac this ends up mapping to command+s whereas on Windows and Linux it maps to ctrl+s.
 *
 * This differs from the array example above because there both ctrl+s
 * and command+s will trigger save on Mac whereas with the mod helper only
 * command+s will.
 */
const defaultCommandsJson = [
  {
    action: CAPTURE,
    cmd: 'mod+shift+,',
    label: 'Capture',
    id: 'capture-hint',
  },
  {
    action: PLAY_PAUSE,
    cmd: 'mod+shift+space',
    label: 'Play/pause',
    id: 'play-pause-hint',
  },
  {
    action: SKIP_5S,
    cmd: 'mod+shift+9',
    label: 'Skip 5s',
    id: 'skip-5s-hint',
  },
  {
    action: BACK_5S,
    cmd: 'mod+shift+8',
    label: 'Back 5s',
    id: 'back-5s-hint',
  },
  {
    action: INCREASE_SPEED,
    cmd: 'mod+shift+0',
    label: 'Faster',
    id: 'increase-speed-hint',
  },
  {
    action: DECREASE_SPEED,
    cmd: 'mod+shift+7',
    label: 'Slower',
    id: 'decrease-speed-hint',
  },
  {
    action: SHOW_HIDE_AREA,
    cmd: 'mod+shift+k',
    label: 'Show/hide area',
    id: 'show-hide-area-hint',
  },
];
