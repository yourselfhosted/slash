import { Button, Option, Select } from "@mui/joy";
import { useEffect, useState } from "react";
import { shortcutService } from "../services";
import { useAppSelector } from "../stores";
import useLoading from "../hooks/useLoading";
import Icon from "../components/Icon";
import ShortcutListView from "../components/ShortcutListView";
import CreateShortcutDialog from "../components/CreateShortcutDialog";

interface State {
  showCreateShortcutDialog: boolean;
}

const Home: React.FC = () => {
  const loadingState = useLoading();
  const { shortcutList } = useAppSelector((state) => state.shortcut);
  const user = useAppSelector((state) => state.user).user as User;
  const [state, setState] = useState<State>({
    showCreateShortcutDialog: false,
  });
  const [selectedFilter, setSelectFilter] = useState<"ALL" | "PRIVATE">("ALL");
  const filteredShortcutList = selectedFilter === "ALL" ? shortcutList : shortcutList.filter((shortcut) => shortcut.creatorId === user.id);

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
          <div className="flex flex-row justify-start items-center">
            <span className="font-mono text-gray-400 mr-2">Shortcuts</span>
            <Button variant="soft" size="sm" onClick={() => setShowCreateShortcutDialog(true)}>
              <Icon.Plus className="w-5 h-auto" /> New
            </Button>
          </div>
          <div>
            <Select defaultValue={"ALL"} onChange={(_, value) => setSelectFilter(value as any)}>
              <Option value={"ALL"}>All</Option>
              <Option value={"PRIVATE"}>Mine</Option>
            </Select>
          </div>
        </div>
        {loadingState.isLoading ? (
          <div className="py-12 w-full flex flex-row justify-center items-center opacity-80">
            <Icon.Loader className="mr-2 w-5 h-auto animate-spin" />
            loading
          </div>
        ) : filteredShortcutList.length === 0 ? (
          <div className="py-4 w-full flex flex-col justify-center items-center">
            <Icon.PackageOpen className="w-12 h-auto text-gray-400" />
            <p className="mt-4 mb-2">No shortcuts found.</p>
            <Button size="sm" onClick={() => setShowCreateShortcutDialog(true)}>
              Create one
            </Button>
          </div>
        ) : (
          <ShortcutListView shortcutList={filteredShortcutList} />
        )}
      </div>

      {state.showCreateShortcutDialog && (
        <CreateShortcutDialog onClose={() => setShowCreateShortcutDialog(false)} onConfirm={() => setShowCreateShortcutDialog(false)} />
      )}
    </>
  );
};

export default Home;
