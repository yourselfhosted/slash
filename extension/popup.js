import { getSlashData } from "./common.js";

const saveButton = document.body.querySelector("#save-button");
const domainInput = document.body.querySelector("#domain-input");

saveButton.addEventListener("click", () => {
  chrome.storage.local.set({
    slash: {
      domain: domainInput.value,
    },
  });
});

(async () => {
  try {
    const slashData = await getSlashData();
    if (slashData) {
      domainInput.value = slashData.domain;
    }
  } catch (error) {
    // do nothing.
  }
})();
