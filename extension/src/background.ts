import type { Shortcut } from "@/types/proto/api/v2/shortcut_service_pb";
import { Storage } from "@plasmohq/storage";

const storage = new Storage();
const urlRegex = /https?:\/\/s\/(.+)/;

chrome.tabs.onUpdated.addListener(async (tabId, _, tab) => {
  if (typeof tab.url === "string") {
    const matchResult = urlRegex.exec(tab.url);
    const sname = Array.isArray(matchResult) ? matchResult[1] : null;
    if (sname) {
      const shortcuts = (await storage.getItem<Shortcut[]>("shortcuts")) || [];
      const shortcut = shortcuts.find((shortcut) => shortcut.name === sname);
      if (!shortcut) {
        return;
      }
      return chrome.tabs.update(tabId, { url: shortcut.link });
    }
  }
});
