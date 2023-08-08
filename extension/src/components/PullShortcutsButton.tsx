import { Button } from "@mui/joy";
import { useStorage } from "@plasmohq/storage/hook";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Shortcut } from "@/types/proto/api/v2/shortcut_service_pb";
import Icon from "./Icon";
import "./style.css";

function PullShortcutsButton() {
  const [domain] = useStorage("domain");
  const [accessToken] = useStorage("access_token");
  const [shortcuts, setShortcuts] = useStorage("shortcuts");
  const [isPulling, setIsPulling] = useState(false);

  const handlePullShortcuts = async () => {
    try {
      setIsPulling(true);
      const { data } = await axios.get<Shortcut[]>(`${domain}/api/v1/shortcut`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setShortcuts(data);
      toast.success("Shortcuts pulled");
    } catch (error) {
      toast.error("Failed to pull shortcuts, error: " + error.message);
    }
    setIsPulling(false);
  };

  return (
    <div className="w-full mt-4">
      <Button loading={isPulling} className="w-full" onClick={handlePullShortcuts}>
        <Icon.RefreshCcw className="w-5 h-auto mr-1" />
        <span>Pull</span>
        <span className="opacity-70 ml-1">{Array.isArray(shortcuts) ? `(${shortcuts.length})` : ""}</span>
      </Button>
    </div>
  );
}

export default PullShortcutsButton;
