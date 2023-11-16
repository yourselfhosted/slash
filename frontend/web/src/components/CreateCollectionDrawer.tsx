import { Button, DialogActions, DialogContent, DialogTitle, Drawer, Input, ModalClose, Radio, RadioGroup } from "@mui/joy";
import { isUndefined } from "lodash-es";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/stores";
import useCollectionStore from "@/stores/v1/collection";
import { Collection } from "@/types/proto/api/v2/collection_service";
import { Visibility } from "@/types/proto/api/v2/common";
import { convertVisibilityFromPb } from "@/utils/visibility";
import useLoading from "../hooks/useLoading";
import Icon from "./Icon";
import ShortcutView from "./ShortcutView";

interface Props {
  collectionId?: number;
  onClose: () => void;
  onConfirm?: () => void;
}

interface State {
  collectionCreate: Collection;
}

const CreateCollectionDrawer: React.FC<Props> = (props: Props) => {
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
  const unselectedShortcuts = shortcutList
    .filter((shortcut) => (state.collectionCreate.visibility === Visibility.PUBLIC ? shortcut.visibility === "PUBLIC" : true))
    .filter((shortcut) => !selectedShortcuts.find((selectedShortcut) => selectedShortcut.id === shortcut.id));

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
    if (!state.collectionCreate.name || !state.collectionCreate.title) {
      toast.error("Please fill in required fields.");
      return;
    }
    if (selectedShortcuts.length === 0) {
      toast.error("Please select at least one shortcut.");
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
      toast.error(error.details);
    }
  };

  return (
    <Drawer anchor="right" open={true} onClose={onClose}>
      <DialogTitle>{isCreating ? "Create Collection" : "Edit Collection"}</DialogTitle>
      <ModalClose />
      <DialogContent className="max-w-full sm:max-w-sm">
        <div className="overflow-y-auto w-full mt-2 px-3 pb-4">
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Name <span className="text-red-600">*</span>
            </span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="Should be an unique name and will be put in url"
                value={state.collectionCreate.name}
                onChange={handleNameInputChange}
              />
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Title <span className="text-red-600">*</span>
            </span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="A short title to describe your collection"
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
                placeholder="A slightly longer description"
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
            <div className="w-full py-1 px-px flex flex-row justify-start items-start flex-wrap overflow-hidden gap-2">
              {selectedShortcuts.map((shortcut) => {
                return (
                  <ShortcutView
                    key={shortcut.id}
                    className="!w-auto select-none max-w-[40%] cursor-pointer bg-gray-100 shadow dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-400"
                    shortcut={shortcut}
                    onClick={() => {
                      setSelectedShortcuts([...selectedShortcuts.filter((selectedShortcut) => selectedShortcut.id !== shortcut.id)]);
                    }}
                  />
                );
              })}
              {unselectedShortcuts.map((shortcut) => {
                return (
                  <ShortcutView
                    key={shortcut.id}
                    className="!w-auto select-none max-w-[40%] border-dashed cursor-pointer"
                    shortcut={shortcut}
                    onClick={() => {
                      setSelectedShortcuts([...selectedShortcuts, shortcut]);
                    }}
                  />
                );
              })}
              {selectedShortcuts.length + unselectedShortcuts.length === 0 && (
                <div className="w-full flex flex-row justify-center items-center text-gray-400">
                  <Icon.PackageOpen className="w-6 h-auto" />
                  <p className="ml-2">No shortcuts found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <div className="w-full flex flex-row justify-end items-center px-3 py-4 space-x-2">
          <Button color="neutral" variant="plain" disabled={requestState.isLoading} loading={requestState.isLoading} onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button color="primary" disabled={requestState.isLoading} loading={requestState.isLoading} onClick={handleSaveBtnClick}>
            {t("common.save")}
          </Button>
        </div>
      </DialogActions>
    </Drawer>
  );
};

export default CreateCollectionDrawer;
