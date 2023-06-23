import { useEffect, useState } from "react";
import { shortcutService } from "../services";
import { useAppSelector } from "../stores";
import useLoading from "../hooks/useLoading";
import Icon from "../components/Icon";
import Dropdown from "../components/common/Dropdown";
import ShortcutListView from "../components/ShortcutListView";
import CreateShortcutDialog from "../components/CreateShortcutDialog";

interface State {
  showCreateShortcutDialog: boolean;
}

const Home: React.FC = () => {
  const loadingState = useLoading();
  const { shortcutList } = useAppSelector((state) => state.shortcut);
  const [state, setState] = useState<State>({
    showCreateShortcutDialog: false,
  });

  useEffect(() => {
    Promise.all([shortcutService.getMyAllShortcuts()]).finally(() => {
      loadingState.setFinish();
    });
  }, []);

  const setShowCreateShortcutDialog = (show: boolean) => {
    setState({
      ...state,
      showCreateShortcutDialog: show,
    });
  };

  return (
    <>
      <div className="mx-auto max-w-4xl w-full px-3 py-6 flex flex-col justify-start items-start">
        <div className="w-full flex flex-row justify-between items-center mb-4">
          <span className="font-mono text-gray-400">Shortcuts</span>
          <div>
            <Dropdown
              trigger={
                <button className="w-32 flex flex-row justify-start items-center border px-3 leading-10 rounded-lg cursor-pointer hover:shadow">
                  <Icon.Plus className="w-4 h-auto mr-1" /> Add new...
                </button>
              }
              actions={
                <>
                  <button
                    className="w-full flex flex-row justify-start items-center px-3 leading-10 rounded cursor-pointer hover:bg-gray-100"
                    onClick={() => setShowCreateShortcutDialog(true)}
                  >
                    Shortcut
                  </button>
                </>
              }
              actionsClassName="!w-32"
            />
          </div>
        </div>
        {loadingState.isLoading ? (
          <div className="py-4 w-full flex flex-row justify-center items-center">
            <Icon.Loader className="mr-2 w-5 h-auto animate-spin" />
            loading
          </div>
        ) : (
          <ShortcutListView shortcutList={shortcutList} />
        )}
      </div>

      {state.showCreateShortcutDialog && (
        <CreateShortcutDialog onClose={() => setShowCreateShortcutDialog(false)} onConfirm={() => setShowCreateShortcutDialog(false)} />
      )}
    </>
  );
};

export default Home;
