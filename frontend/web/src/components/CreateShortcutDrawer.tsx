import classnames from "classnames";
import { isUndefined, uniq } from "lodash-es";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import useLoading from "@/hooks/useLoading";
import { useShortcutStore, useWorkspaceStore } from "@/stores";
import { getShortcutUpdateMask } from "@/stores/shortcut";
import { Visibility } from "@/types/proto/api/v1/common";
import { Shortcut } from "@/types/proto/api/v1/shortcut_service";
import Icon from "./Icon";

interface Props {
  shortcutId?: number;
  initialShortcut?: Partial<Shortcut>;
  onClose: () => void;
  onConfirm?: () => void;
}

interface State {
  shortcutCreate: Shortcut;
}

const CreateShortcutDrawer: React.FC<Props> = (props: Props) => {
  const { onClose, onConfirm, shortcutId, initialShortcut } = props;
  const { t } = useTranslation();
  const [state, setState] = useState<State>({
    shortcutCreate: Shortcut.fromPartial({
      visibility: Visibility.WORKSPACE,
      ogMetadata: {
        title: "",
        description: "",
        image: "",
      },
      ...initialShortcut,
    }),
  });
  const shortcutStore = useShortcutStore();
  const workspaceStore = useWorkspaceStore();
  const [showOpenGraphMetadata, setShowOpenGraphMetadata] = useState<boolean>(false);
  const shortcutList = shortcutStore.getShortcutList();
  const [tag, setTag] = useState<string>("");
  const tagSuggestions = uniq(shortcutList.map((shortcut) => shortcut.tags).flat());
  const isCreating = isUndefined(shortcutId);
  const loadingState = useLoading(!isCreating);
  const requestState = useLoading(false);

  const setPartialState = (partialState: Partial<State>) => {
    setState({
      ...state,
      ...partialState,
    });
  };

  useEffect(() => {
    if (workspaceStore.setting.defaultVisibility !== Visibility.VISIBILITY_UNSPECIFIED) {
      setPartialState({
        shortcutCreate: Object.assign(state.shortcutCreate, {
          visibility: workspaceStore.setting.defaultVisibility,
        }),
      });
    }
  }, []);

  useEffect(() => {
    if (shortcutId) {
      const shortcut = shortcutStore.getShortcutById(shortcutId);
      if (shortcut) {
        setState({
          ...state,
          shortcutCreate: Object.assign(state.shortcutCreate, {
            name: shortcut.name,
            link: shortcut.link,
            title: shortcut.title,
            description: shortcut.description,
            visibility: shortcut.visibility,
            ogMetadata: shortcut.ogMetadata,
          }),
        });
        setTag(shortcut.tags.join(" "));
        loadingState.setFinish();
      }
    }
  }, [shortcutId]);

  if (loadingState.isLoading) {
    return null;
  }

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        name: e.target.value.replace(/\s+/g, "-"),
      }),
    });
  };

  const handleLinkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        link: e.target.value,
      }),
    });
  };

  const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        title: e.target.value,
      }),
    });
  };

  const handleDescriptionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        description: e.target.value,
      }),
    });
  };

  const handleTagsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setTag(text);
  };

  const handleOpenGraphMetadataImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        ogMetadata: {
          ...state.shortcutCreate.ogMetadata,
          image: e.target.value,
        },
      }),
    });
  };

  const handleOpenGraphMetadataTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        ogMetadata: {
          ...state.shortcutCreate.ogMetadata,
          title: e.target.value,
        },
      }),
    });
  };

  const handleOpenGraphMetadataDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        ogMetadata: {
          ...state.shortcutCreate.ogMetadata,
          description: e.target.value,
        },
      }),
    });
  };

  const handleTagSuggestionsClick = (suggestion: string) => {
    if (tag === "") {
      setTag(suggestion);
    } else {
      setTag(`${tag} ${suggestion}`);
    }
  };

  const handleSaveBtnClick = async () => {
    if (!state.shortcutCreate.name || !state.shortcutCreate.link) {
      toast.error("Please fill in required fields.");
      return;
    }

    try {
      requestState.setLoading();
      const tags = tag.split(" ").filter(Boolean);
      if (shortcutId) {
        const originShortcut = shortcutStore.getShortcutById(shortcutId);
        const updatingShortcut = {
          ...state.shortcutCreate,
          id: shortcutId,
          tags,
        };
        await shortcutStore.updateShortcut(updatingShortcut, getShortcutUpdateMask(originShortcut, updatingShortcut));
      } else {
        await shortcutStore.createShortcut({
          ...state.shortcutCreate,
          tags,
        });
      }

      requestState.setFinish();
      if (onConfirm) {
        onConfirm();
      } else {
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.details || "An error occurred");
      requestState.setFinish();
    }
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isCreating ? "Create Shortcut" : "Edit Shortcut"}</SheetTitle>
          <SheetDescription>{isCreating ? "Create a new shortcut" : "Edit your shortcut details"}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">s/</span>
              <Input
                id="name"
                type="text"
                placeholder="An easy name to remember"
                value={state.shortcutCreate.name}
                onChange={handleNameInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">
              Link <span className="text-destructive">*</span>
            </Label>
            <Input
              id="link"
              type="text"
              placeholder="The destination link of the shortcut"
              value={state.shortcutCreate.link}
              onChange={handleLinkInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="The title of the shortcut"
              value={state.shortcutCreate.title}
              onChange={handleTitleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder="A short description of the shortcut"
              value={state.shortcutCreate.description}
              onChange={handleDescriptionInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" type="text" placeholder="The tags of shortcut" value={tag} onChange={handleTagsInputChange} />
            {tagSuggestions.length > 0 && (
              <div className="flex flex-row items-start gap-2 mt-2">
                <Icon.Asterisk className="w-4 h-auto shrink-0 mt-0.5 text-muted-foreground" />
                <div className="flex flex-row flex-wrap gap-2">
                  {tagSuggestions.map((tag) => (
                    <span
                      className="text-muted-foreground cursor-pointer text-sm hover:text-foreground transition-colors"
                      key={tag}
                      onClick={() => handleTagSuggestionsClick(tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="public"
              checked={state.shortcutCreate.visibility === Visibility.PUBLIC}
              onCheckedChange={(checked) =>
                setPartialState({
                  shortcutCreate: Object.assign(state.shortcutCreate, {
                    visibility: checked ? Visibility.PUBLIC : Visibility.WORKSPACE,
                  }),
                })
              }
            />
            <Label htmlFor="public" className="text-sm font-normal cursor-pointer">
              {t(`shortcut.visibility.public.description`)}
            </Label>
          </div>

          <Separator className="my-4" />

          <div className="border rounded-lg overflow-hidden">
            <div
              className={classnames(
                "flex flex-row justify-between items-center px-3 py-2 cursor-pointer hover:bg-accent transition-colors",
                showOpenGraphMetadata && "bg-accent border-b",
              )}
              onClick={() => setShowOpenGraphMetadata(!showOpenGraphMetadata)}
            >
              <span className="text-sm flex items-center gap-1">
                Social media metadata
                <Icon.Sparkles className="w-4 h-auto text-primary" />
              </span>
              <Icon.ChevronDown
                className={classnames("w-4 h-auto text-muted-foreground transition-transform", showOpenGraphMetadata && "rotate-180")}
              />
            </div>
            {showOpenGraphMetadata && (
              <div className="p-3 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="og-image" className="text-sm">
                    Image URL
                  </Label>
                  <Input
                    id="og-image"
                    type="text"
                    placeholder="https://the.link.to/the/image.png"
                    value={state.shortcutCreate.ogMetadata?.image}
                    onChange={handleOpenGraphMetadataImageChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og-title" className="text-sm">
                    Title
                  </Label>
                  <Input
                    id="og-title"
                    type="text"
                    placeholder="Slash - An open source, self-hosted platform"
                    value={state.shortcutCreate.ogMetadata?.title}
                    onChange={handleOpenGraphMetadataTitleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og-description" className="text-sm">
                    Description
                  </Label>
                  <Textarea
                    id="og-description"
                    placeholder="An open source, self-hosted platform for sharing and managing your most frequently used links."
                    rows={3}
                    value={state.shortcutCreate.ogMetadata?.description}
                    onChange={handleOpenGraphMetadataDescriptionChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={requestState.isLoading}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSaveBtnClick} disabled={requestState.isLoading}>
            {requestState.isLoading ? "Saving..." : t("common.save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CreateShortcutDrawer;
