import { getShortifyData } from "./common.js";

const saveButton = document.body.querySelector("#save-button");
const domainInput = document.body.querySelector("#domain-input");

saveButton.addEventListener("click", () => {
  chrome.storage.local.set({
    shortify: {
      domain: domainInput.value,
    },
  });
});

(async () => {
  try {
    const shortifyData = await getShortifyData();
    if (shortifyData) {
      domainInput.value = shortifyData.domain;
    }
  } catch (error) {
    // do nothing.
  }
})();
