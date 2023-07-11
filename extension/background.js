import { getSlashData } from "./common.js";

const urlRegex = /https?:\/\/s\/(.+)/;

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (typeof tab.url === "string") {
    const matchResult = urlRegex.exec(tab.url);
    if (matchResult) {
      const slashData = await getSlashData();
      const name = matchResult[1];
      const url = `${slashData.domain}/s/${name}`;
      return chrome.tabs.update(tab.id, { url });
    }
  }
});

chrome.omnibox.onInputEntered.addListener(async (text) => {
  const slashData = await getSlashData();
  const url = `${slashData.domain}/s/${text}`;
  return chrome.tabs.update({ url });
});
