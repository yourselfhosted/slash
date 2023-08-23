import type { Shortcut } from "../../../types/proto/api/v2/shortcut_service_pb";
import { useStorage } from "@plasmohq/storage/hook";
import classNames from "classnames";
import ShortcutView from "./ShortcutView";

const ShortcutsContainer = () => {
  const [shortcuts] = useStorage<Shortcut[]>("shortcuts", (v) => (v ? v : []));

  return (
    <div className={classNames("w-full grid grid-cols-2 gap-2")}>
      {shortcuts.map((shortcut) => {
        return <ShortcutView key={shortcut.id} shortcut={shortcut} />;
      })}
    </div>
  );
};

export default ShortcutsContainer;
