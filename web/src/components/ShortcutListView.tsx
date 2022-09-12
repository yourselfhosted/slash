import { shortcutService } from "../services";
import Dropdown from "./common/Dropdown";
import showCreateShortcutDialog from "./CreateShortcutDialog";

interface Props {
  workspaceId: WorkspaceId;
  shortcutList: Shortcut[];
}

const ShortcutListView: React.FC<Props> = (props: Props) => {
  const { workspaceId, shortcutList } = props;

  const handleDeleteShortcutButtonClick = (shortcut: Shortcut) => {
    shortcutService.deleteShortcutById(shortcut.id);
  };

  return (
    <div className="w-full flex flex-col justify-start items-start">
      {shortcutList.map((shortcut) => {
        return (
          <div key={shortcut.id} className="w-full flex flex-row justify-between items-start border px-6 py-4 mb-3 rounded-lg">
            <div className="flex flex-col justify-start items-start">
              <span className="text-lg font-medium">{shortcut.name}</span>
              <span className="text-base text-gray-600">{shortcut.link}</span>
            </div>
            <Dropdown>
              <span
                className="w-full px-2 leading-8 cursor-pointer rounded hover:bg-gray-100"
                onClick={() => showCreateShortcutDialog(workspaceId, shortcut.id)}
              >
                Edit
              </span>
              <span
                className="w-full px-2 leading-8 cursor-pointer rounded text-red-600 hover:bg-gray-100"
                onClick={() => {
                  handleDeleteShortcutButtonClick(shortcut);
                }}
              >
                Delete
              </span>
            </Dropdown>
          </div>
        );
      })}
    </div>
  );
};

export default ShortcutListView;
