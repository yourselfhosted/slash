const getCorgiData = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["corgi"], (data) => {
      resolve(data?.corgi);
    });
  });
};

const saveButton = document.body.querySelector("#save-button");
const domainInput = document.body.querySelector("#domain-input");
const openIdInput = document.body.querySelector("#openid-input");

saveButton.addEventListener("click", () => {
  chrome.storage.local.set({
    corgi: {
      domain: domainInput.value,
      openId: openIdInput.value,
    },
  });
});

(async () => {
  const corgiData = await getCorgiData();
  domainInput.value = corgiData.domain;
  openIdInput.value = corgiData.openId;
})();
