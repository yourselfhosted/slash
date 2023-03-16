import { getShortifyData } from "./common.js";

const saveButton = document.body.querySelector("#save-button");
const domainInput = document.body.querySelector("#domain-input");
const openIdInput = document.body.querySelector("#openid-input");

saveButton.addEventListener("click", () => {
  chrome.storage.local.set({
    shortify: {
      domain: domainInput.value,
      openId: openIdInput.value,
    },
  });
});

(async () => {
  const shortifyData = await getShortifyData();
  if (shortifyData) {
    domainInput.value = shortifyData.domain;
    openIdInput.value = shortifyData.openId;
  }
})();
