export const getShortifyData = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["shortify"], (data) => {
      if (data?.shortify) {
        resolve(data.shortify);
      } else {
        reject("shortify data not found");
      }
    });
  });
};
