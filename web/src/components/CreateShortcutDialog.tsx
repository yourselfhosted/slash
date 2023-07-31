import { Button, Divider, Input, Modal, ModalDialog, Radio, RadioGroup, Textarea } from "@mui/joy";
import classnames from "classnames";
import { isUndefined } from "lodash-es";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import useLoading from "../hooks/useLoading";
import { shortcutService } from "../services";
import Icon from "./Icon";

interface Props {
  shortcutId?: ShortcutId;
  onClose: () => void;
  onConfirm?: () => void;
}

interface State {
  shortcutCreate: ShortcutCreate;
}

const visibilities: Visibility[] = ["PRIVATE", "WORKSPACE", "PUBLIC"];

const CreateShortcutDialog: React.FC<Props> = (props: Props) => {
  const { onClose, onConfirm, shortcutId } = props;
  const { t } = useTranslation();
  const [state, setState] = useState<State>({
    shortcutCreate: {
      name: "",
      link: "",
      title: "",
      description: "",
      visibility: "PRIVATE",
      tags: [],
      openGraphMetadata: {
        title: "",
        description: "",
        image: "",
      },
    },
  });
  const [showAdditionalFields, setShowAdditionalFields] = useState<boolean>(false);
  const [showOpenGraphMetadata, setShowOpenGraphMetadata] = useState<boolean>(false);
  const [tag, setTag] = useState<string>("");
  const requestState = useLoading(false);
  const isCreating = isUndefined(shortcutId);

  useEffect(() => {
    if (shortcutId) {
      const shortcut = shortcutService.getShortcutById(shortcutId);
      if (shortcut) {
        setState({
          ...state,
          shortcutCreate: Object.assign(state.shortcutCreate, {
            name: shortcut.name,
            link: shortcut.link,
            description: shortcut.description,
            visibility: shortcut.visibility,
            openGraphMetadata: shortcut.openGraphMetadata,
          }),
        });
        setTag(shortcut.tags.join(" "));
      }
    }
  }, [shortcutId]);

  const setPartialState = (partialState: Partial<State>) => {
    setState({
      ...state,
      ...partialState,
    });
  };

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        name: e.target.value.replace(/\s+/g, "-").toLowerCase(),
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
        openGraphMetadata: {
          ...state.shortcutCreate.openGraphMetadata,
          image: e.target.value,
        },
      }),
    });
  };

  const handleOpenGraphMetadataTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        openGraphMetadata: {
          ...state.shortcutCreate.openGraphMetadata,
          title: e.target.value,
        },
      }),
    });
  };

  const handleOpenGraphMetadataDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        openGraphMetadata: {
          ...state.shortcutCreate.openGraphMetadata,
          description: e.target.value,
        },
      }),
    });
  };

  const handleSaveBtnClick = async () => {
    if (!state.shortcutCreate.name) {
      toast.error("Name is required");
      return;
    }

    try {
      if (shortcutId) {
        await shortcutService.patchShortcut({
          id: shortcutId,
          name: state.shortcutCreate.name,
          link: state.shortcutCreate.link,
          description: state.shortcutCreate.description,
          visibility: state.shortcutCreate.visibility,
          tags: tag.split(" "),
          openGraphMetadata: state.shortcutCreate.openGraphMetadata,
        });
      } else {
        await shortcutService.createShortcut({
          ...state.shortcutCreate,
          tags: tag.split(" "),
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
        <div className="flex flex-row justify-between items-center w-80 sm:w-96 mb-4">
          <span className="text-lg font-medium">{isCreating ? "Create Shortcut" : "Edit Shortcut"}</span>
          <Button variant="plain" onClick={onClose}>
            <Icon.X className="w-5 h-auto text-gray-600" />
          </Button>
        </div>
        <div className="overflow-y-auto overflow-x-hidden">
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Title</span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="Title"
                value={state.shortcutCreate.title}
                onChange={handleTitleInputChange}
              />
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Name</span>
            <div className="relative w-full">
              <Input
                className="w-full"
                type="text"
                placeholder="Unique shortcut name"
                value={state.shortcutCreate.name}
                onChange={handleNameInputChange}
              />
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Destination URL</span>
            <Input
              className="w-full"
              type="text"
              placeholder="https://github.com/boojack/slash"
              value={state.shortcutCreate.link}
              onChange={handleLinkInputChange}
            />
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Tags</span>
            <Input className="w-full" type="text" placeholder="github slash" value={tag} onChange={handleTagsInputChange} />
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Visibility</span>
            <div className="w-full flex flex-row justify-start items-center text-base">
              <RadioGroup orientation="horizontal" value={state.shortcutCreate.visibility} onChange={handleVisibilityInputChange}>
                {visibilities.map((visibility) => (
                  <Radio key={visibility} value={visibility} label={t(`shortcut.visibility.${visibility.toLowerCase()}.self`)} />
                ))}
              </RadioGroup>
            </div>
            <p className="mt-3 text-sm text-gray-500 w-full bg-gray-100 border border-gray-200 px-2 py-1 rounded-md">
              {t(`shortcut.visibility.${state.shortcutCreate.visibility.toLowerCase()}.description`)}
            </p>
          </div>
          <Divider className="text-gray-500">Optional</Divider>
          <div className="w-full flex flex-col justify-start items-start border rounded-md overflow-hidden my-3">
            <div
              className={classnames(
                "w-full flex flex-row justify-between items-center px-2 py-1 cursor-pointer hover:bg-gray-100",
                showAdditionalFields ? "bg-gray-100 border-b" : ""
              )}
              onClick={() => setShowAdditionalFields(!showAdditionalFields)}
            >
              <span className="text-sm">Additional fields</span>
              <button className="w-7 h-7 p-1 rounded-md">
                <Icon.ChevronDown className={classnames("w-4 h-auto text-gray-500", showAdditionalFields ? "transform rotate-180" : "")} />
              </button>
            </div>
            {showAdditionalFields && (
              <div className="w-full px-2 py-1">
                <div className="w-full flex flex-col justify-start items-start mb-3">
                  <span className="mb-2 text-sm">Description</span>
                  <Input
                    className="w-full"
                    type="text"
                    placeholder="Github repo for slash"
                    size="sm"
                    value={state.shortcutCreate.description}
                    onChange={handleDescriptionInputChange}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="w-full flex flex-col justify-start items-start border rounded-md overflow-hidden">
            <div
              className={`w-full flex flex-row justify-between items-center px-2 py-1 cursor-pointer hover:bg-gray-100 ${
                showOpenGraphMetadata ? "bg-gray-100 border-b" : ""
              }`}
              onClick={() => setShowOpenGraphMetadata(!showOpenGraphMetadata)}
            >
              <span className="text-sm flex flex-row justify-start items-center">
                Social media metadata
                <Icon.Sparkles className="ml-1 w-4 h-auto text-blue-600" />
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
                    value={state.shortcutCreate.openGraphMetadata.image}
                    onChange={handleOpenGraphMetadataImageChange}
                  />
                </div>
                <div className="w-full flex flex-col justify-start items-start mb-3">
                  <span className="mb-2 text-sm">Title</span>
                  <Input
                    className="w-full"
                    type="text"
                    placeholder="Slash - An open source, self-hosted bookmarks and link sharing platform"
                    size="sm"
                    value={state.shortcutCreate.openGraphMetadata.title}
                    onChange={handleOpenGraphMetadataTitleChange}
                  />
                </div>
                <div className="w-full flex flex-col justify-start items-start mb-3">
                  <span className="mb-2 text-sm">Description</span>
                  <Textarea
                    className="w-full"
                    placeholder="An open source, self-hosted bookmarks and link sharing platform."
                    size="sm"
                    maxRows={3}
                    value={state.shortcutCreate.openGraphMetadata.description}
                    onChange={handleOpenGraphMetadataDescriptionChange}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="w-full flex flex-row justify-end items-center mt-4 space-x-2">
            <Button color="neutral" variant="plain" disabled={requestState.isLoading} loading={requestState.isLoading} onClick={onClose}>
              Cancel
            </Button>
            <Button color="primary" disabled={requestState.isLoading} loading={requestState.isLoading} onClick={handleSaveBtnClick}>
              Save
            </Button>
          </div>
        </div>
      </ModalDialog>
    </Modal>
  );
};

export default CreateShortcutDialog;
