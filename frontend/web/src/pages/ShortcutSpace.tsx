import { useEffect } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { isURL } from "@/helpers/utils";
import useShortcutStore from "@/stores/v1/shortcut";

const ShortcutSpace = () => {
  const params = useParams();
  const shortcutName = params["*"] || "";
  const shortcutStore = useShortcutStore();
  const shortcut = shortcutStore.getShortcutByName(shortcutName);

  useEffect(() => {
    (async () => {
      try {
        await shortcutStore.getOrFetchShortcutByName(shortcutName, true);
      } catch (error: any) {
        console.error(error);
        toast.error(error.details);
      }
    })();
  }, [shortcutName]);

  if (!shortcut) {
    return null;
  }

  if (isURL(shortcut.link)) {
    window.document.title = "Redirecting...";
    window.location.href = shortcut.link;
    return null;
  }

  return <div>{shortcut.link}</div>;
};

export default ShortcutSpace;
