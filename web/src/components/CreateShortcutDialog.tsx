import { Button, Divider, Input, Modal, ModalDialog, Radio, RadioGroup } from "@mui/joy";
import { isUndefined } from "lodash-es";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { shortcutService } from "../services";
import useLoading from "../hooks/useLoading";
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
      description: "",
      visibility: "PRIVATE",
      tags: [],
    },
  });
  const [showDescriptionAndTag, setShowDescriptionAndTag] = useState<boolean>(false);
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
          }),
        });
        setTag(shortcut.tags.join(" "));
        if (shortcut.description !== "" || shortcut.tags.length > 0) {
          setShowDescriptionAndTag(true);
        }
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

  const handleVisibilityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      shortcutCreate: Object.assign(state.shortcutCreate, {
        visibility: e.target.value,
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
        <div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Name <span className="text-red-600">*</span>
            </span>
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
            <span className="mb-2">
              Destination URL <span className="text-red-600">*</span>
            </span>
            <Input
              className="w-full"
              type="text"
              placeholder="e.g. https://github.com/boojack/slash"
              value={state.shortcutCreate.link}
              onChange={handleLinkInputChange}
            />
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Visibility <span className="text-red-600">*</span>
            </span>
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
          <div
            className="w-full flex flex-row justify-between items-center my-3"
            onClick={() => setShowDescriptionAndTag(!showDescriptionAndTag)}
          >
            <span className={`${showDescriptionAndTag ? "" : "text-gray-500"}`}>Description and tags</span>
            <button className="w-7 h-7 p-1 rounded-md hover:bg-gray-100">
              <Icon.ChevronDown className={`w-5 h-auto text-gray-500 ${showDescriptionAndTag ? "transform rotate-180" : ""}`} />
            </button>
          </div>
          {showDescriptionAndTag && (
            <>
              <div className="w-full flex flex-col justify-start items-start mb-3">
                <span className="mb-2">Description</span>
                <Input
                  className="w-full"
                  type="text"
                  placeholder="Something to describe the url"
                  value={state.shortcutCreate.description}
                  onChange={handleDescriptionInputChange}
                />
              </div>
              <div className="w-full flex flex-col justify-start items-start mb-3">
                <span className="mb-2">Tags</span>
                <Input className="w-full" type="text" placeholder="Separated by spaces" value={tag} onChange={handleTagsInputChange} />
              </div>
            </>
          )}

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
