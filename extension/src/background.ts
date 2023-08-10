import type { Shortcut } from "@/types/proto/api/v2/shortcut_service_pb";
import { Storage } from "@plasmohq/storage";

const storage = new Storage();
const urlRegex = /https?:\/\/s\/(.+)/;

chrome.tabs.onUpdated.addListener(async (tabId, _, tab) => {
  if (!tab.url) {
    return;
  }

  const shortcutName = getShortcutNameFromUrl(tab.url);
  if (shortcutName) {
    const shortcuts = (await storage.getItem<Shortcut[]>("shortcuts")) || [];
    const shortcut = shortcuts.find((shortcut) => shortcut.name === shortcutName);
    if (!shortcut) {
      return;
    }
    return chrome.tabs.update(tabId, { url: shortcut.link });
  }
});

chrome.omnibox.onInputEntered.addListener(async (text) => {
  const shortcuts = (await storage.getItem<Shortcut[]>("shortcuts")) || [];
  const shortcut = shortcuts.find((shortcut) => shortcut.name === text);
  if (!shortcut) {
    return;
  }
  return chrome.tabs.update({ url: shortcut.link });
});

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
