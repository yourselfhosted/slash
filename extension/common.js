export const getSlashData = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["slash"], (data) => {
      if (data?.slash) {
        resolve(data.slash);
      } else {
        reject("slash data not found");
      }
    });
  });
};
