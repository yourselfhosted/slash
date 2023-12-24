import { IconButton } from "@mui/joy";
import { useStorage } from "@plasmohq/storage/hook";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import useShortcutStore from "@/store/shortcut";
import Icon from "./Icon";

const PullShortcutsButton = () => {
  const [instanceUrl] = useStorage("domain");
  const [accessToken] = useStorage("access_token");
  const shortcutStore = useShortcutStore();

  useEffect(() => {
    if (instanceUrl && accessToken) {
      handlePullShortcuts(true);
    }
  }, [instanceUrl, accessToken]);

  const handlePullShortcuts = async (silence = false) => {
    try {
      await shortcutStore.fetchShortcutList(instanceUrl, accessToken);
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
