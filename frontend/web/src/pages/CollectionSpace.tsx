import { Divider } from "@mui/joy";
import classNames from "classnames";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import Icon from "@/components/Icon";
import ShortcutView from "@/components/ShortcutView";
import useResponsiveWidth from "@/hooks/useResponsiveWidth";
import useCollectionStore from "@/stores/v1/collection";
import useShortcutStore from "@/stores/v1/shortcut";
import useUserStore from "@/stores/v1/user";
import { Collection } from "@/types/proto/api/v2/collection_service";
import { Shortcut } from "@/types/proto/api/v2/shortcut_service";
import { convertShortcutFromPb } from "@/utils/shortcut";

const CollectionSpace = () => {
  const { collectionName } = useParams();
  const { sm } = useResponsiveWidth();
  const userStore = useUserStore();
  const collectionStore = useCollectionStore();
  const shortcutStore = useShortcutStore();
  const [collection, setCollection] = useState<Collection>();
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [selectedShortcut, setSelectedShortcut] = useState<Shortcut>();

  if (!collectionName) {
    return null;
  }

  useEffect(() => {
    (async () => {
      try {
        const collection = await collectionStore.fetchCollectionByName(collectionName);
        await userStore.getOrFetchUserById(collection.creatorId);
        setCollection(collection);
        setShortcuts([]);
        for (const shortcutId of collection.shortcutIds) {
          try {
            const shortcut = await shortcutStore.getOrFetchShortcutById(shortcutId);
            setShortcuts((shortcuts) => {
              return [...shortcuts, shortcut];
            });
          } catch (error) {
            // do nth
          }
        }
        document.title = `${collection.title} - Slash`;
      } catch (error: any) {
        console.error(error);
        toast.error(error.details);
      }
    })();
  }, [collectionName]);

  if (!collection) {
    return null;
  }

  const creator = userStore.getUserById(collection.creatorId);

  const handleShortcutClick = (shortcut: Shortcut) => {
    if (sm) {
      setSelectedShortcut(shortcut);
    } else {
      window.open(`/s/${shortcut.name}`);
    }
  };

  return (
    <div className="w-full h-full sm:px-12 sm:py-10 sm:h-screen sm:bg-gray-100 dark:sm:bg-zinc-800">
      <div className="w-full h-full flex flex-row sm:border dark:sm:border-zinc-800 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900">
        <div className="w-full sm:w-56 sm:pr-4 flex flex-col justify-start items-start overflow-auto shrink-0">
          <div className="w-full sticky top-0 bg-gray-50 dark:bg-zinc-900">
            <div className="w-full flex flex-row justify-start items-center text-gray-800 dark:text-gray-300">
              <Icon.LibrarySquare className="w-5 h-auto mr-2 opacity-70" />
              <span className="text-lg">{collection.title}</span>
            </div>
            <p className="text-gray-500 text-sm">{collection.description}</p>
            <Divider className="!my-2" />
          </div>
          <div className="w-full flex flex-col justify-start items-start gap-2 sm:gap-1 px-px">
            {shortcuts.map((shortcut) => {
              return (
                <ShortcutView
                  className={classNames(
                    "w-full py-2 cursor-pointer",
                    selectedShortcut?.id === shortcut.id
                      ? "bg-gray-100 dark:bg-zinc-800"
                      : "sm:border-transparent dark:sm:border-transparent"
                  )}
                  key={shortcut.name}
                  shortcut={convertShortcutFromPb(shortcut)}
                  alwaysShowLink={!sm}
                  onClick={() => handleShortcutClick(shortcut)}
                />
              );
            })}
          </div>
        </div>
        {sm && (
          <div className="w-full h-full overflow-clip rounded-lg border dark:border-zinc-800 bg-white dark:bg-zinc-800">
            {selectedShortcut ? (
              <div className="w-full h-full flex flex-col justify-center items-center p-8">
                <Link
                  className="w-72 max-w-full border dark:border-zinc-900 dark:bg-zinc-900 p-6 rounded-2xl shadow-xl dark:text-gray-400 hover:opacity-80"
                  to={`/s/${selectedShortcut.name}`}
                  target="_blank"
                >
                  <Icon.Globe2Icon className="w-12 h-auto mb-1" strokeWidth={1} />
                  <p className="text-lg font-medium leading-8">{selectedShortcut.title || selectedShortcut.name}</p>
                  <p className="text-gray-500">{selectedShortcut.description}</p>
                  <Divider className="!my-2" />
                  <p className="text-gray-400 dark:text-gray-600 text-sm mt-2">
                    <span className="leading-4">Open this site in a new tab</span>
                    <Icon.ArrowUpRight className="inline-block ml-1 -mt-0.5 w-4 h-auto" />
                  </p>
                </Link>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col justify-center items-center p-8">
                <div className="w-72 max-w-full border dark:border-zinc-900 dark:bg-zinc-900 dark:text-gray-400 p-6 rounded-2xl shadow-xl">
                  <Icon.AppWindow className="w-12 h-auto mb-2" strokeWidth={1} />
                  <p className="text-lg font-medium">Click on a tab in the Sidebar to get started.</p>
                  <Divider className="!my-2" />
                  <p className="text-gray-400 dark:text-gray-600 text-sm mt-2">
                    Shared by <span className="italic font-medium">{creator.nickname}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionSpace;
