import { Button } from "@mui/joy";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CollectionView from "@/components/CollectionView";
import CreateCollectionDialog from "@/components/CreateCollectionDialog";
import { shortcutService } from "@/services";
import useCollectionStore from "@/stores/v1/collection";
import FilterView from "../components/FilterView";
import Icon from "../components/Icon";
import useLoading from "../hooks/useLoading";

interface State {
  showCreateCollectionDialog: boolean;
}

const CollectionDashboard: React.FC = () => {
  const { t } = useTranslation();
  const loadingState = useLoading();
  const collectionStore = useCollectionStore();
  const collections = collectionStore.getCollectionList();
  const [state, setState] = useState<State>({
    showCreateCollectionDialog: false,
  });

  useEffect(() => {
    Promise.all([shortcutService.getMyAllShortcuts(), collectionStore.fetchCollectionList()]).finally(() => {
      loadingState.setFinish();
    });
  }, []);

  const setShowCreateCollectionDialog = (show: boolean) => {
    setState({
      ...state,
      showCreateCollectionDialog: show,
    });
  };

  return (
    <>
      <div className="mx-auto max-w-8xl w-full px-3 md:px-12 pt-4 pb-6 flex flex-col justify-start items-start">
        <div className="w-full flex flex-row justify-start items-start mb-4">
          <div className="bg-yellow-100 dark:bg-yellow-500 dark:opacity-70 py-2 px-3 rounded-full border dark:border-yellow-600 flex flex-row justify-start items-center cursor-pointer shadow">
            <Icon.LibrarySquare className="w-5 h-auto opacity-60" />
            <a
              className="hover:underline hover:text-blue-600"
              href="https://github.com/boojack/slash/blob/main/docs/getting-started/collections.md"
              target="_blank"
            >
              <span className="mx-1 text-sm">Collection is in Beta. Learn more in docs</span>
              <Icon.ExternalLink className="w-4 h-auto inline-block" />
            </a>
          </div>
        </div>
        <div className="w-full flex flex-row justify-between items-center mb-4">
          <div className="flex flex-row justify-start items-center">
            <Button className="hover:shadow" variant="soft" size="sm" onClick={() => setShowCreateCollectionDialog(true)}>
              <Icon.Plus className="w-5 h-auto" />
              <span className="ml-0.5">{t("common.create")}</span>
            </Button>
          </div>
        </div>
        <FilterView />
        {loadingState.isLoading ? (
          <div className="py-12 w-full flex flex-row justify-center items-center opacity-80 dark:text-gray-500">
            <Icon.Loader className="mr-2 w-5 h-auto animate-spin" />
            {t("common.loading")}
          </div>
        ) : collections.length === 0 ? (
          <div className="py-16 w-full flex flex-col justify-center items-center text-gray-400">
            <Icon.PackageOpen className="w-16 h-auto" strokeWidth="1" />
            <p className="mt-4">No collections found.</p>
          </div>
        ) : (
          <div className="w-full flex flex-col justify-start items-start gap-3">
            {collections.map((collection) => {
              return <CollectionView key={collection.id} collection={collection} />;
            })}
          </div>
        )}
      </div>

      {state.showCreateCollectionDialog && (
        <CreateCollectionDialog
          onClose={() => setShowCreateCollectionDialog(false)}
          onConfirm={() => setShowCreateCollectionDialog(false)}
        />
      )}
    </>
  );
};

export default CollectionDashboard;
