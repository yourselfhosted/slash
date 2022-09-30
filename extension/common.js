export const getCorgiData = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["corgi"], (data) => {
      if (data?.corgi) {
        resolve(data.corgi);
      } else {
        reject("corgi data not found");
      }
    });
  });
};
