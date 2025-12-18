import { isUndefined } from "lodash-es";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import useLoading from "@/hooks/useLoading";
import { useCollectionStore, useShortcutStore, useWorkspaceStore } from "@/stores";
import { Collection } from "@/types/proto/api/v1/collection_service";
import { Visibility } from "@/types/proto/api/v1/common";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";
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
  const workspaceStore = useWorkspaceStore();
  const collectionStore = useCollectionStore();
  const shortcutList = useShortcutStore().getShortcutList();
  const [state, setState] = useState<State>({
    collectionCreate: Collection.fromPartial({
      visibility: Visibility.WORKSPACE,
    }),
  });
  const [selectedShortcuts, setSelectedShortcuts] = useState<Shortcut[]>([]);
  const isCreating = isUndefined(collectionId);
  const loadingState = useLoading(!isCreating);
  const requestState = useLoading(false);
  const unselectedShortcuts = shortcutList
    .filter((shortcut) => {
      if (state.collectionCreate.visibility === Visibility.PUBLIC) {
        return shortcut.visibility === Visibility.PUBLIC;
      } else if (state.collectionCreate.visibility === Visibility.WORKSPACE) {
        return shortcut.visibility === Visibility.PUBLIC || shortcut.visibility === Visibility.WORKSPACE;
      } else {
        return true;
      }
    })
    .filter((shortcut) => !selectedShortcuts.find((selectedShortcut) => selectedShortcut.id === shortcut.id));

  const setPartialState = (partialState: Partial<State>) => {
    setState({
      ...state,
      ...partialState,
    });
  };

  useEffect(() => {
    if (workspaceStore.setting.defaultVisibility !== Visibility.VISIBILITY_UNSPECIFIED) {
      setPartialState({
        collectionCreate: Object.assign(state.collectionCreate, {
          visibility: workspaceStore.setting.defaultVisibility,
        }),
      });
    }
  }, []);

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
              .filter(Boolean) as Shortcut[],
          );
          loadingState.setFinish();
        }
      }
    })();
  }, [collectionId]);

  if (loadingState.isLoading) {
    return null;
  }

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
          ["name", "title", "description", "visibility", "shortcut_ids"],
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
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isCreating ? "Create Collection" : "Edit Collection"}</SheetTitle>
          <SheetDescription>{isCreating ? "Create a new collection of shortcuts" : "Edit your collection details"}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">c/</span>
              <Input
                id="name"
                type="text"
                placeholder="An easy name to remember"
                value={state.collectionCreate.name}
                onChange={handleNameInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="A short title of your collection"
              value={state.collectionCreate.title}
              onChange={handleTitleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder="A slightly longer description"
              value={state.collectionCreate.description}
              onChange={handleDescriptionInputChange}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="public"
              checked={state.collectionCreate.visibility === Visibility.PUBLIC}
              onCheckedChange={(checked) =>
                setPartialState({
                  collectionCreate: Object.assign(state.collectionCreate, {
                    visibility: checked ? Visibility.PUBLIC : Visibility.WORKSPACE,
                  }),
                })
              }
            />
            <Label htmlFor="public" className="text-sm font-normal cursor-pointer">
              {t(`shortcut.visibility.public.description`)}
            </Label>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <Label>Shortcuts</Label>
              <span className="text-sm text-muted-foreground">({selectedShortcuts.length})</span>
              {selectedShortcuts.length === 0 && <span className="text-sm italic text-muted-foreground">(Select a shortcut first)</span>}
            </div>
            <div className="w-full py-1 px-px flex flex-row justify-start items-start flex-wrap gap-2">
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
                <div className="w-full flex flex-row justify-center items-center text-muted-foreground">
                  <Icon.PackageOpen className="w-6 h-auto" />
                  <p className="ml-2">No shortcuts found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <SheetFooter className="mt-6">
          <Button variant="outline" disabled={requestState.isLoading} onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button disabled={requestState.isLoading} onClick={handleSaveBtnClick}>
            {requestState.isLoading ? "Saving..." : t("common.save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CreateCollectionDrawer;
