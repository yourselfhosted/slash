import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { isURL } from "@/helpers/utils";
import useShortcutStore from "@/stores/v1/shortcut";
import { Shortcut } from "@/types/proto/api/v2/shortcut_service";

const ShortcutSpace = () => {
  const params = useParams();
  const shortcutName = params["*"] || "";
  const shortcutStore = useShortcutStore();
  const [shortcut, setShortcut] = useState<Shortcut>();

  useEffect(() => {
    (async () => {
      try {
        const shortcut = await shortcutStore.fetchShortcutByName(shortcutName);
        setShortcut(shortcut);
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
