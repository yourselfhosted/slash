import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Input,
  ModalClose,
  Radio,
  RadioGroup,
  Textarea,
} from "@mui/joy";
import classnames from "classnames";
import { isUndefined, uniq } from "lodash-es";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
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

  const handleVisibilityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        visibility: e.target.value,
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
      <DialogTitle>{isCreating ? "Create Shortcut" : "Edit Shortcut"}</DialogTitle>
      <ModalClose />
      <DialogContent className="w-full max-w-full">
        <div className="overflow-y-auto w-full mt-2 px-4 pb-4 sm:w-[24rem]">
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Name <span className="text-red-600">*</span>
            </span>
            <Input
              className="w-full"
              type="text"
              placeholder="The memorable name of the shortcut"
              value={state.shortcutCreate.name}
              onChange={handleNameInputChange}
            />
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Link <span className="text-red-600">*</span>
            </span>
            <Input
              className="w-full"
              type="text"
              placeholder="The destination link of the shortcut"
              value={state.shortcutCreate.link}
              onChange={handleLinkInputChange}
            />
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Title</span>
            <Input
              className="w-full"
              type="text"
              placeholder="The title of the shortcut"
              value={state.shortcutCreate.title}
              onChange={handleTitleInputChange}
            />
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Description</span>
            <Input
              className="w-full"
              type="text"
              placeholder="A short description of the shortcut"
              value={state.shortcutCreate.description}
              onChange={handleDescriptionInputChange}
            />
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Tags</span>
            <Input className="w-full" type="text" placeholder="The tags of shortcut" value={tag} onChange={handleTagsInputChange} />
            {tagSuggestions.length > 0 && (
              <div className="w-full flex flex-row justify-start items-start mt-2">
                <Icon.Asterisk className="w-4 h-auto shrink-0 mx-1 text-gray-400 dark:text-gray-500" />
                <div className="w-auto flex flex-row justify-start items-start flex-wrap gap-x-2 gap-y-1">
                  {tagSuggestions.map((tag) => (
                    <span
                      className="text-gray-600 dark:text-gray-500 cursor-pointer max-w-[6rem] truncate block text-sm flex-nowrap leading-4 hover:text-black dark:hover:text-gray-400"
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
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Visibility</span>
            <div className="w-full flex flex-row justify-start items-center text-base">
              <RadioGroup orientation="horizontal" value={state.shortcutCreate.visibility} onChange={handleVisibilityInputChange}>
                <Radio value={Visibility.WORKSPACE} label={t(`shortcut.visibility.workspace.self`)} />
                <Radio value={Visibility.PUBLIC} label={t(`shortcut.visibility.public.self`)} />
              </RadioGroup>
            </div>
            <p className="mt-3 text-sm text-gray-500 w-full bg-gray-100 border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-400 px-2 py-1 rounded-md">
              {t(`shortcut.visibility.${state.shortcutCreate.visibility.toLowerCase()}.description`)}
            </p>
          </div>
          <Divider className="text-gray-500">More</Divider>
          <div className="w-full flex flex-col justify-start items-start border rounded-md mt-3 overflow-hidden dark:border-zinc-800">
            <div
              className={classnames(
                "w-full flex flex-row justify-between items-center px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800",
                showOpenGraphMetadata ? "bg-gray-100 border-b dark:bg-zinc-800 dark:border-b-zinc-700" : "",
              )}
              onClick={() => setShowOpenGraphMetadata(!showOpenGraphMetadata)}
            >
              <span className="text-sm flex flex-row justify-start items-center">
                Social media metadata
                <Icon.Sparkles className="w-4 h-auto shrink-0 ml-1 text-blue-600 dark:text-blue-500" />
              </span>
              <button className="w-7 h-7 p-1 rounded-md">
                <Icon.ChevronDown className={classnames("w-4 h-auto text-gray-500", showOpenGraphMetadata ? "transform rotate-180" : "")} />
              </button>
            </div>
            {showOpenGraphMetadata && (
              <div className="w-full px-2 py-1">
                <div className="w-full flex flex-col justify-start items-start mb-3">
                  <span className="mb-2 text-sm">Image URL</span>
                  <Input
                    className="w-full"
                    type="text"
                    placeholder="https://the.link.to/the/image.png"
                    size="sm"
                    value={state.shortcutCreate.ogMetadata?.image}
                    onChange={handleOpenGraphMetadataImageChange}
                  />
                </div>
                <div className="w-full flex flex-col justify-start items-start mb-3">
                  <span className="mb-2 text-sm">Title</span>
                  <Input
                    className="w-full"
                    type="text"
                    placeholder="Slash - An open source, self-hosted platform for sharing and managing your most frequently used links"
                    size="sm"
                    value={state.shortcutCreate.ogMetadata?.title}
                    onChange={handleOpenGraphMetadataTitleChange}
                  />
                </div>
                <div className="w-full flex flex-col justify-start items-start mb-3">
                  <span className="mb-2 text-sm">Description</span>
                  <Textarea
                    className="w-full"
                    placeholder="An open source, self-hosted platform for sharing and managing your most frequently used links."
                    size="sm"
                    maxRows={3}
                    value={state.shortcutCreate.ogMetadata?.description}
                    onChange={handleOpenGraphMetadataDescriptionChange}
                  />
                </div>
              </div>
            )}
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

export default CreateShortcutDrawer;
