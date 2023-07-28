import { Button, Input } from "@mui/joy";
import { useEffect, useState } from "react";
import { shortcutService } from "../services";
import { useAppSelector } from "../stores";
import useViewStore, { getFilteredShortcutList, getOrderedShortcutList } from "../stores/v1/view";
import useUserStore from "../stores/v1/user";
import useLoading from "../hooks/useLoading";
import Icon from "../components/Icon";
import ShortcutsContainer from "../components/ShortcutsContainer";
import CreateShortcutDialog from "../components/CreateShortcutDialog";
import FilterView from "../components/FilterView";
import ViewSetting from "../components/ViewSetting";
import Navigator from "../components/Navigator";

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
      <div className="mx-auto max-w-4xl w-full px-3 pt-4 pb-6 flex flex-col justify-start items-start">
        <Navigator />
        <div className="w-full flex flex-row justify-between items-center mb-4">
          <div className="flex flex-row justify-start items-center">
            <Input
              className="w-32 mr-2"
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
            <ViewSetting />
          </div>
          <div className="flex flex-row justify-end items-center">
            <Button className="hover:shadow" variant="soft" size="sm" onClick={() => setShowCreateShortcutDialog(true)}>
              <Icon.Plus className="w-5 h-auto" />
              <span className="hidden sm:block ml-0.5">Create</span>
            </Button>
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
          <ShortcutsContainer shortcutList={orderedShortcutList} />
        )}
      </div>

      {state.showCreateShortcutDialog && (
        <CreateShortcutDialog onClose={() => setShowCreateShortcutDialog(false)} onConfirm={() => setShowCreateShortcutDialog(false)} />
      )}
    </>
  );
};

export default Home;
