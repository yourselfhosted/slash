import { Tooltip } from "@mui/joy";
import classNames from "classnames";
import copy from "copy-to-clipboard";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { absolutifyLink } from "@/helpers/utils";
import useNavigateTo from "@/hooks/useNavigateTo";
import useResponsiveWidth from "@/hooks/useResponsiveWidth";
import { useCollectionStore, useShortcutStore, useUserStore } from "@/stores";
import { Collection } from "@/types/proto/api/v1/collection_service";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";
import { showCommonDialog } from "./Alert";
import CreateCollectionDialog from "./CreateCollectionDrawer";
import Icon from "./Icon";
import ShortcutView from "./ShortcutView";
import Dropdown from "./common/Dropdown";

interface Props {
  collection: Collection;
}

const CollectionView = (props: Props) => {
  const { collection } = props;
  const { t } = useTranslation();
  const { sm } = useResponsiveWidth();
  const navigateTo = useNavigateTo();
  const userStore = useUserStore();
  const currentUser = userStore.getCurrentUser();
  const collectionStore = useCollectionStore();
  const shortcutList = useShortcutStore().getShortcutList();
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const shortcuts = collection.shortcutIds
    .map((shortcutId) => shortcutList.find((shortcut) => shortcut?.id === shortcutId))
    .filter(Boolean) as any as Shortcut[];
  const showAdminActions = currentUser.id === collection.creatorId;

  const handleCopyCollectionLink = () => {
    copy(absolutifyLink(`/c/${collection.name}`));
    toast.success("Collection link copied to clipboard.");
  };

  const handleDeleteCollectionButtonClick = () => {
    showCommonDialog({
      title: "Delete Collection",
      content: `Are you sure to delete collection \`${collection.name}\`? You cannot undo this action.`,
      style: "danger",
      onConfirm: async () => {
        await collectionStore.deleteCollection(collection.id);
      },
    });
  };

  const handleShortcutClick = (shortcut: Shortcut) => {
    navigateTo(`/shortcut/${shortcut.id}`);
  };

  const handleOpenAllShortcutsButtonClick = () => {
    shortcuts.forEach((shortcut: Shortcut) => window.open(`/s/${shortcut.name}`));
  };

  return (
    <>
      <div className={classNames("w-full flex flex-col justify-start items-start border rounded-lg hover:shadow dark:border-zinc-800")}>
        <div className="bg-gray-100 dark:bg-zinc-800 px-3 py-2 w-full flex flex-row justify-between items-center rounded-t-lg">
          <div className="w-auto flex flex-col justify-start items-start mr-2">
            <div className="w-full truncate">
              <Link className="leading-6 font-medium dark:text-gray-400" to={`/c/${collection.name}`} viewTransition>
                {collection.title}
              </Link>
              <span className="ml-1 leading-6 text-gray-500 dark:text-gray-400" onClick={handleCopyCollectionLink}>
                (c/{collection.name})
              </span>
            </div>
            <p className="text-sm text-gray-500">{collection.description}</p>
          </div>
          <div className="flex flex-row justify-end items-center shrink-0 gap-2">
            <Tooltip title="Share" placement="top" arrow>
              <Link className="w-auto text-gray-400 cursor-pointer hover:text-gray-500" to={`/c/${collection.name}`} target="_blank">
                <Icon.Share className="w-4 h-auto" />
              </Link>
            </Tooltip>
            <Tooltip title="Open all" placement="top" arrow>
              <button
                className="w-auto text-gray-400 cursor-pointer hover:text-gray-500"
                onClick={() => handleOpenAllShortcutsButtonClick()}
              >
                <Icon.ArrowUpRight className="w-5 h-auto" />
              </button>
            </Tooltip>
            {showAdminActions && (
              <Dropdown
                trigger={
                  <button className="flex flex-row justify-center items-center rounded text-gray-400 cursor-pointer hover:text-gray-500">
                    <Icon.MoreVertical className="w-4 h-auto" />
                  </button>
                }
                actionsClassName="!w-28 text-sm"
                actions={
                  <>
                    <button
                      className="w-full px-2 flex flex-row justify-start items-center text-left dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                      onClick={() => setShowEditDialog(true)}
                    >
                      <Icon.Edit className="w-4 h-auto mr-2" /> {t("common.edit")}
                    </button>
                    <button
                      className="w-full px-2 flex flex-row justify-start items-center text-left text-red-600 dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                      onClick={() => {
                        handleDeleteCollectionButtonClick();
                      }}
                    >
                      <Icon.Trash className="w-4 h-auto mr-2" /> {t("common.delete")}
                    </button>
                  </>
                }
              ></Dropdown>
            )}
          </div>
        </div>
        <div className="w-full p-3 flex flex-row justify-start items-start flex-wrap gap-3">
          {shortcuts.map((shortcut) => {
            return (
              <ShortcutView
                key={shortcut.id}
                className="!w-auto"
                shortcut={shortcut}
                alwaysShowLink={!sm}
                onClick={() => handleShortcutClick(shortcut)}
              />
            );
          })}
        </div>
      </div>

      {showEditDialog && (
        <CreateCollectionDialog
          collectionId={collection.id}
          onClose={() => setShowEditDialog(false)}
          onConfirm={() => setShowEditDialog(false)}
        />
      )}
    </>
  );
};

export default CollectionView;
