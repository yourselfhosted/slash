import { getCorgiData } from "./common.js";

const urlRegex = /https?:\/\/o\/(.+)/;

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (typeof tab.url === "string") {
    const matchResult = urlRegex.exec(tab.url);
    if (matchResult) {
      const corgiData = await getCorgiData();
      const name = matchResult[1];
      const url = `${corgiData.domain}/api/shortcut?openId=${corgiData.openId}&name=${name}&redirect=true`;
      return chrome.tabs.update({ url });
    }
  }
});

chrome.omnibox.onInputEntered.addListener(async (text) => {
  const corgiData = await getCorgiData();
  const url = `${corgiData.domain}/api/shortcut?openId=${corgiData.openId}&name=${text}&redirect=true`;
  return chrome.tabs.update({ url });
});
