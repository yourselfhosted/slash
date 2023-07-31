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
  const layout = viewStore.layout || "grid";
  const [editingShortcutId, setEditingShortcutId] = useState<ShortcutId | undefined>();

  return (
    <>
      <div
        className={classNames(
          "w-full flex flex-col justify-start items-start gap-y-2",
          layout === "grid" && "sm:grid sm:grid-cols-2 sm:gap-2"
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
