import { Storage } from "@plasmohq/storage";

const storage = new Storage();
const urlRegex = /https?:\/\/s\/(.+)/;

chrome.webRequest.onBeforeRequest.addListener(
  (param) => {
    (async () => {
      if (!param.url) {
        return;
      }

      const shortcutName = getShortcutNameFromUrl(param.url);
      if (shortcutName) {
        const instanceUrl = (await storage.getItem<string>("domain")) || "";
        return chrome.tabs.update({ url: `${instanceUrl}/s/${shortcutName}` });
      }
    })();
  },
  { urls: ["*://s/*", "*://*/search*"] }
);

const getShortcutNameFromUrl = (urlString: string) => {
  const matchResult = urlRegex.exec(urlString);
  if (matchResult === null) {
    return getShortcutNameFromSearchUrl(urlString);
  }
  return matchResult[1];
};

const getShortcutNameFromSearchUrl = (urlString: string) => {
  const url = new URL(urlString);
  if ((url.hostname === "www.google.com" || url.hostname === "www.bing.com") && url.pathname === "/search") {
    const params = new URLSearchParams(url.search);
    const shortcutName = params.get("q");
    if (typeof shortcutName === "string" && shortcutName.startsWith("s/")) {
      return shortcutName.slice(2);
    }
  } else if (url.hostname === "www.baidu.com" && url.pathname === "/s") {
    const params = new URLSearchParams(url.search);
    const shortcutName = params.get("wd");
    if (typeof shortcutName === "string" && shortcutName.startsWith("s/")) {
      return shortcutName.slice(2);
    }
  } else if (url.hostname === "duckduckgo.com" && url.pathname === "/") {
    const params = new URLSearchParams(url.search);
    const shortcutName = params.get("q");
    if (typeof shortcutName === "string" && shortcutName.startsWith("s/")) {
      return shortcutName.slice(2);
    }
  }
  return "";
};
