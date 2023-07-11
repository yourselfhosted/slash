import { getShortifyData } from "./common.js";

const urlRegex = /https?:\/\/s\/(.+)/;

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (typeof tab.url === "string") {
    const matchResult = urlRegex.exec(tab.url);
    if (matchResult) {
      const shortifyData = await getShortifyData();
      const name = matchResult[1];
      const url = `${shortifyData.domain}/s/${name}`;
      return chrome.tabs.update({ url });
    }
  }
});

chrome.omnibox.onInputEntered.addListener(async (text) => {
  const shortifyData = await getShortifyData();
  const url = `${shortifyData.domain}/s/${text}`;
  return chrome.tabs.update({ url });
});
