import { useState } from "react";
import CreateShortcutDialog from "./CreateShortcutDialog";
import ShortcutView from "./ShortcutView";

interface Props {
  shortcutList: Shortcut[];
}

const ShortcutListView: React.FC<Props> = (props: Props) => {
  const { shortcutList } = props;
  const [editingShortcutId, setEditingShortcutId] = useState<ShortcutId | undefined>();

  return (
    <>
      <div className="w-full flex flex-col justify-start items-start">
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

export default ShortcutListView;
