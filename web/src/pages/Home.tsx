import { Button } from "@mui/joy";
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
                    <Icon.Link className="w-4 h-auto text-gray-500 mr-1" />
                    Shortcut
                  </button>
                </>
              }
              actionsClassName="!w-32"
            />
          </div>
        </div>
        {loadingState.isLoading ? (
          <div className="py-12 w-full flex flex-row justify-center items-center opacity-80">
            <Icon.Loader className="mr-2 w-5 h-auto animate-spin" />
            loading
          </div>
        ) : shortcutList.length === 0 ? (
          <div className="py-4 w-full flex flex-col justify-center items-center">
            <Icon.PackageOpen className="w-12 h-auto text-gray-400" />
            <p className="mt-4 mb-2">No shortcuts found.</p>
            <Button size="sm" onClick={() => setShowCreateShortcutDialog(true)}>
              Create one
            </Button>
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
