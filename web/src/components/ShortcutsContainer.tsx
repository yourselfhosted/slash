import { useState } from "react";
import CreateShortcutDialog from "./CreateShortcutDialog";
import ShortcutView from "./ShortcutView";
import useViewStore from "../stores/v1/view";
import classNames from "classnames";

interface Props {
  shortcutList: Shortcut[];
}

const ShortcutsContainer: React.FC<Props> = (props: Props) => {
  const { shortcutList } = props;
  const viewStore = useViewStore();
  const layout = viewStore.layout || "list";
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

      <p className="w-full text-center text-gray-400 text-sm mt-2 mb-4 italic">Total {shortcutList.length} data</p>

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
