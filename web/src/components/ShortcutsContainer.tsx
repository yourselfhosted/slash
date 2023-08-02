import classNames from "classnames";
import { useState } from "react";
import useViewStore from "../stores/v1/view";
import CreateShortcutDialog from "./CreateShortcutDialog";
import ShortcutView from "./ShortcutView";

interface Props {
  shortcutList: Shortcut[];
}

const ShortcutsContainer: React.FC<Props> = (props: Props) => {
  const { shortcutList } = props;
  const viewStore = useViewStore();
  const displayStyle = viewStore.displayStyle || "full";
  const [editingShortcutId, setEditingShortcutId] = useState<ShortcutId | undefined>();

  return (
    <>
      <div
        className={classNames(
          "w-full grid grid-cols-1 gap-y-2 sm:gap-2",
          displayStyle === "full" ? "sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-4 gap-2"
        )}
      >
        {shortcutList.map((shortcut) => {
          return <ShortcutView key={shortcut.id} shortcut={shortcut} handleEdit={() => setEditingShortcutId(shortcut.id)} />;
        })}
      </div>

      {editingShortcutId && (
        <CreateShortcutDialog
          shortcutId={editingShortcutId}
          onClose={() => setEditingShortcutId(undefined)}
          onConfirm={() => setEditingShortcutId(undefined)}
        />
      )}
    </>
  );
};

export default ShortcutsContainer;
