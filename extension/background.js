console.log('background');

const getExtensionIdFromTab = (tab) => {
  return JSON.parse(tab.extData).ext_id;
};

// const writeToClipboard = () => {
//   const pasteTarget = document.createElement('div');
//   pasteTarget.contentEditable = true;
//   const actElem = document.activeElement.appendChild(pasteTarget).parentNode;
//   pasteTarget.focus();
//   document.execCommand('Paste', null, null);
//   const paste = pasteTarget.innerText;
//   actElem.removeChild(pasteTarget);
//   return paste;
// };

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  chrome.tabs.sendMessage(sender.tab.id, { request, sender }, (response) => {
    sendResponse(response);
  });

  return true;
});
