import { Button, Input, Modal, ModalDialog, Radio, RadioGroup } from "@mui/joy";
import classNames from "classnames";
import { isUndefined } from "lodash-es";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getFaviconWithGoogleS2 } from "@/helpers/utils";
import useResponsiveWidth from "@/hooks/useResponsiveWidth";
import { useAppSelector } from "@/stores";
import useCollectionStore from "@/stores/v1/collection";
import { Collection } from "@/types/proto/api/v2/collection_service";
import { Visibility } from "@/types/proto/api/v2/common";
import { convertVisibilityFromPb } from "@/utils/visibility";
import useLoading from "../hooks/useLoading";
import Icon from "./Icon";

interface Props {
  collectionId?: number;
  onClose: () => void;
  onConfirm?: () => void;
}

interface State {
  collectionCreate: Collection;
}

const CreateCollectionDialog: React.FC<Props> = (props: Props) => {
  const { onClose, onConfirm, collectionId } = props;
  const { t } = useTranslation();
  const collectionStore = useCollectionStore();
  const { shortcutList } = useAppSelector((state) => state.shortcut);
  const [state, setState] = useState<State>({
    collectionCreate: Collection.fromPartial({
      visibility: Visibility.PRIVATE,
    }),
  });
  const [selectedShortcuts, setSelectedShortcuts] = useState<Shortcut[]>([]);
  const requestState = useLoading(false);
  const isCreating = isUndefined(collectionId);
  const unselectedShortcuts = shortcutList.filter(
    (shortcut) => !selectedShortcuts.find((selectedShortcut) => selectedShortcut.id === shortcut.id)
  );

  useEffect(() => {
    (async () => {
      if (collectionId) {
        const collection = await collectionStore.getOrFetchCollectionById(collectionId);
        if (collection) {
          setState({
            ...state,
            collectionCreate: Object.assign(state.collectionCreate, {
              ...collection,
            }),
          });
          setSelectedShortcuts(
            collection.shortcutIds
              .map((shortcutId) => shortcutList.find((shortcut) => shortcut.id === shortcutId))
              .filter(Boolean) as Shortcut[]
          );
        }
      }
    })();
  }, [collectionId]);

  const setPartialState = (partialState: Partial<State>) => {
    setState({
      ...state,
      ...partialState,
    });
  };

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      collectionCreate: Object.assign(state.collectionCreate, {
        name: e.target.value.replace(/\s+/g, "-"),
      }),
    });
  };

  const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      collectionCreate: Object.assign(state.collectionCreate, {
        title: e.target.value,
      }),
    });
  };

  const handleVisibilityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      collectionCreate: Object.assign(state.collectionCreate, {
        visibility: Number(e.target.value),
      }),
    });
  };

  const handleDescriptionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      collectionCreate: Object.assign(state.collectionCreate, {
        description: e.target.value,
      }),
    });
  };

  const handleSaveBtnClick = async () => {
    if (!state.collectionCreate.name) {
      toast.error("Name is required");
      return;
    }

    try {
      if (!isCreating) {
        await collectionStore.updateCollection(
          {
            id: collectionId,
            name: state.collectionCreate.name,
            title: state.collectionCreate.title,
            description: state.collectionCreate.description,
            visibility: state.collectionCreate.visibility,
            shortcutIds: selectedShortcuts.map((shortcut) => shortcut.id),
          },
          ["name", "title", "description", "visibility", "shortcut_ids"]
        );
      } else {
        await collectionStore.createCollection({
          ...state.collectionCreate,
          shortcutIds: selectedShortcuts.map((shortcut) => shortcut.id),
        });
      }

      if (onConfirm) {
        onConfirm();
      } else {
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <Modal open={true}>
      <ModalDialog>
        <div className="w-full flex flex-row justify-between items-center">
          <span className="text-lg font-medium">{isCreating ? "Create Collection" : "Edit Collection"}</span>
          <Button variant="plain" onClick={onClose}>
            <Icon.X className="w-5 h-auto text-gray-600" />
          </Button>
        </div>
        <div className="overflow-y-auto overflow-x-hidden w-80 sm:w-96 max-w-full">
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Name</span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="Unique collection name"
                value={state.collectionCreate.name}
                onChange={handleNameInputChange}
              />
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Title</span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="Title"
                value={state.collectionCreate.title}
                onChange={handleTitleInputChange}
              />
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Description</span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="Description"
                value={state.collectionCreate.description}
                onChange={handleDescriptionInputChange}
              />
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Visibility</span>
            <div className="w-full flex flex-row justify-start items-center text-base">
              <RadioGroup orientation="horizontal" value={state.collectionCreate.visibility} onChange={handleVisibilityInputChange}>
                <Radio value={Visibility.PRIVATE} label={t(`shortcut.visibility.private.self`)} />
                <Radio value={Visibility.PUBLIC} label={t(`shortcut.visibility.public.self`)} />
              </RadioGroup>
            </div>
            <p className="mt-3 text-sm text-gray-500 w-full bg-gray-100 border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-400 px-2 py-1 rounded-md">
              {t(`shortcut.visibility.${convertVisibilityFromPb(state.collectionCreate.visibility).toLowerCase()}.description`)}
            </p>
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <p className="mb-2">
              <span>Shortcuts</span>
              <span className="opacity-60">({selectedShortcuts.length})</span>
              {selectedShortcuts.length === 0 && <span className="ml-2 italic opacity-80 text-sm">Select a shortcut first</span>}
            </p>
            <div className="w-full py-1 flex flex-row justify-start items-start flex-wrap overflow-hidden gap-2">
              {selectedShortcuts.map((shortcut) => {
                return (
                  <ShortcutItem
                    key={shortcut.id}
                    className="bg-gray-100 shadow dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-400"
                    shortcut={shortcut}
                    onClick={() => {
                      setSelectedShortcuts([...selectedShortcuts.filter((selectedShortcut) => selectedShortcut.id !== shortcut.id)]);
                    }}
                  />
                );
              })}
              {unselectedShortcuts.map((shortcut) => {
                return (
                  <ShortcutItem
                    key={shortcut.id}
                    className="border-dashed"
                    shortcut={shortcut}
                    onClick={() => {
                      setSelectedShortcuts([...selectedShortcuts, shortcut]);
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="w-full flex flex-row justify-end items-center mt-4 space-x-2">
            <Button color="neutral" variant="plain" disabled={requestState.isLoading} loading={requestState.isLoading} onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button color="primary" disabled={requestState.isLoading} loading={requestState.isLoading} onClick={handleSaveBtnClick}>
              {t("common.save")}
            </Button>
          </div>
        </div>
      </ModalDialog>
    </Modal>
  );
};

interface ShortcutItemProps {
  shortcut: Shortcut;
  className?: string;
  onClick?: () => void;
}

export const ShortcutItem = (props: ShortcutItemProps) => {
  const { shortcut, className, onClick } = props;
  const { sm } = useResponsiveWidth();
  const favicon = getFaviconWithGoogleS2(shortcut.link);

  return (
    <div
      className={classNames(
        "group w-auto select-none px-2 py-1 flex flex-row justify-start items-center border rounded-lg hover:bg-gray-100 dark:border-zinc-800 dark:hover:bg-zinc-800 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <span className={classNames("w-5 h-5 flex justify-center items-center overflow-clip shrink-0")}>
        {favicon ? (
          <img className="w-full h-auto rounded-full" src={favicon} decoding="async" loading="lazy" />
        ) : (
          <Icon.CircleSlash className="w-full h-auto text-gray-400" />
        )}
      </span>
      <div className="ml-1 w-full flex flex-col justify-start items-start truncate">
        <div className="w-full flex flex-row justify-start items-center">
          <span className={classNames("max-w-full flex flex-row px-1 justify-start items-center rounded-md")}>
            <div className="truncate">
              <span className="dark:text-gray-400">{shortcut.title}</span>
              {shortcut.title ? (
                <span className="text-gray-500">(s/{shortcut.name})</span>
              ) : (
                <>
                  <span className="text-gray-400 dark:text-gray-500">s/</span>
                  <span className="truncate dark:text-gray-400">{shortcut.name}</span>
                </>
              )}
            </div>
          </span>
        </div>
      </div>
      <Link
        className={classNames("w-6 h-6 p-1 rounded-lg bg-gray-200 dark:bg-zinc-900 hover:opacity-80", sm && "hidden group-hover:block")}
        to={`/s/${shortcut.name}`}
        target="_blank"
      >
        <Icon.ArrowUpRight className="w-4 h-auto text-gray-400 shrink-0" />
      </Link>
    </div>
  );
};

export default CreateCollectionDialog;
