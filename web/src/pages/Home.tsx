import { Button, Input, Tab, TabList, Tabs } from "@mui/joy";
import { useEffect, useState } from "react";
import { shortcutService } from "../services";
import { useAppSelector } from "../stores";
import useViewStore, { getFilteredShortcutList, getOrderedShortcutList } from "../stores/v1/view";
import useUserStore from "../stores/v1/user";
import useLoading from "../hooks/useLoading";
import Icon from "../components/Icon";
import ShortcutListView from "../components/ShortcutListView";
import CreateShortcutDialog from "../components/CreateShortcutDialog";
import FilterView from "../components/FilterView";
import OrderSetting from "../components/OrderSetting";

interface State {
  showCreateShortcutDialog: boolean;
}

const Home: React.FC = () => {
  const loadingState = useLoading();
  const currentUser = useUserStore().getCurrentUser();
  const viewStore = useViewStore();
  const { shortcutList } = useAppSelector((state) => state.shortcut);
  const [state, setState] = useState<State>({
    showCreateShortcutDialog: false,
  });
  const filter = viewStore.filter;
  const filteredShortcutList = getFilteredShortcutList(shortcutList, filter, currentUser);
  const orderedShortcutList = getOrderedShortcutList(filteredShortcutList, viewStore.order);

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
          <span className="font-mono text-gray-400 mr-2">Shortcuts</span>
          <Input
            className="w-32"
            type="text"
            size="sm"
            placeholder="Search"
            startDecorator={<Icon.Search className="w-4 h-auto" />}
            endDecorator={
              filter.search && <Icon.X className="w-4 h-auto cursor-pointer" onClick={() => viewStore.setFilter({ search: "" })} />
            }
            value={filter.search}
            onChange={(e) => viewStore.setFilter({ search: e.target.value })}
          />
        </div>
        <div className="w-full flex flex-row justify-between items-center mb-4">
          <div className="flex flex-row justify-start items-center">
            <Button className="hover:shadow" variant="soft" size="sm" onClick={() => setShowCreateShortcutDialog(true)}>
              <Icon.Plus className="w-5 h-auto" /> New
            </Button>
          </div>
          <div className="flex flex-row justify-end items-center">
            <OrderSetting />
            <Tabs
              value={filter.mineOnly ? "PRIVATE" : "ALL"}
              size="sm"
              onChange={(_, value) => viewStore.setFilter({ mineOnly: value !== "ALL" })}
            >
              <TabList>
                <Tab value={"ALL"}>All</Tab>
                <Tab value={"PRIVATE"}>Mine</Tab>
              </TabList>
            </Tabs>
          </div>
        </div>

        <FilterView />

        {loadingState.isLoading ? (
          <div className="py-12 w-full flex flex-row justify-center items-center opacity-80">
            <Icon.Loader className="mr-2 w-5 h-auto animate-spin" />
            loading
          </div>
        ) : orderedShortcutList.length === 0 ? (
          <div className="py-16 w-full flex flex-col justify-center items-center">
            <Icon.PackageOpen className="w-16 h-auto text-gray-400" />
            <p className="mt-4">No shortcuts found.</p>
          </div>
        ) : (
          <ShortcutListView shortcutList={orderedShortcutList} />
        )}
      </div>

      {state.showCreateShortcutDialog && (
        <CreateShortcutDialog onClose={() => setShowCreateShortcutDialog(false)} onConfirm={() => setShowCreateShortcutDialog(false)} />
      )}
    </>
  );
};

export default Home;
