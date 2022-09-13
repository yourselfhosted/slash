const getCorgiData = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["corgi"], (data) => {
      resolve(data?.corgi);
    });
  });
};

const fetchShortcut = async (name) => {
  const corgiData = await getCorgiData();
  if (corgiData.domain && corgiData.openId) {
    const res = await fetch(`${corgiData.domain}/api/shortcut?openId=${corgiData.openId}&name=${name}`);
    const { data } = await res.json();
    if (data.length > 0) {
      return data[0];
    }
  }
};

const urlRegex = /https?:\/\/go\/(.+)/;

chrome.tabs.onUpdated.addListener(async (_, a, tab) => {
  if (typeof tab.url === "string") {
    const matchResult = urlRegex.exec(tab.url);
    if (matchResult) {
      const name = matchResult[1];
      const shortcut = await fetchShortcut(name);
      if (shortcut && shortcut.link) {
        chrome.tabs.update({ url: shortcut.link });
      }
    }
  }
});

chrome.omnibox.onInputEntered.addListener(async (text) => {
  const shortcut = await fetchShortcut(text);
  if (shortcut && shortcut.link) {
    chrome.tabs.update({ url: shortcut.link });
  }
});
