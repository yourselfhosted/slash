import { IconButton } from "@mui/joy";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useStorageContext } from "@/context";
import useShortcutStore from "@/store/shortcut";
import Icon from "./Icon";

const PullShortcutsButton = () => {
  const context = useStorageContext();
  const shortcutStore = useShortcutStore();

  useEffect(() => {
    if (context.instanceUrl && context.accessToken) {
      handlePullShortcuts(true);
    }
  }, [context]);

  const handlePullShortcuts = async (silence = false) => {
    try {
      await shortcutStore.fetchShortcutList(context.instanceUrl, context.accessToken);
      if (!silence) {
        toast.success("Shortcuts pulled");
      }
    } catch (error) {
      toast.error("Failed to pull shortcuts, error: " + error.message);
    }
  };

  return (
    <IconButton color="neutral" variant="plain" size="sm" onClick={() => handlePullShortcuts()}>
      <Icon.RefreshCcw className="w-4 h-auto" />
    </IconButton>
  );
};

export default PullShortcutsButton;
