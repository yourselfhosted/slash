import { Button, Input, Modal, ModalDialog, Radio, RadioGroup } from "@mui/joy";
import { useEffect, useState } from "react";
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

const CreateShortcutDialog: React.FC<Props> = (props: Props) => {
  const { onClose, onConfirm, shortcutId } = props;
  const [state, setState] = useState<State>({
    shortcutCreate: {
      name: "",
      link: "",
      description: "",
      visibility: "PRIVATE",
      tags: [],
    },
  });
  const [tag, setTag] = useState<string>("");
  const requestState = useLoading(false);

  useEffect(() => {
    if (shortcutId) {
      const shortcutTemp = shortcutService.getShortcutById(shortcutId);
      if (shortcutTemp) {
        setState({
          ...state,
          shortcutCreate: Object.assign(state.shortcutCreate, {
            name: shortcutTemp.name,
            link: shortcutTemp.link,
            description: shortcutTemp.description,
            visibility: shortcutTemp.visibility,
          }),
        });
        setTag(shortcutTemp.tags.join(" "));
      }
    }
  }, [shortcutId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const text = e.target.value as string;
    const tempObject = {} as any;
    tempObject[key] = text;

    setState({
      ...state,
      shortcutCreate: Object.assign(state.shortcutCreate, tempObject),
    });
  };

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e, "name");
  };

  const handleLinkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e, "link");
  };

  const handleDescriptionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e, "description");
  };

  const handleTagsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setTag(text);
  };

  const handleVisibilityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e, "visibility");
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
      toast.error(JSON.stringify(error.response.data));
    }
  };

  return (
    <Modal open={true}>
      <ModalDialog>
        <div className="flex flex-row justify-between items-center w-80 sm:w-96 mb-4">
          <span className="text-lg font-medium">{shortcutId ? "Edit Shortcut" : "Create Shortcut"}</span>
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
              <span className="absolute z-1 top-2 left-3 text-gray-400">o/</span>
              <Input
                className="w-full !pl-7"
                type="text"
                placeholder="shortcut-name"
                value={state.shortcutCreate.name}
                onChange={handleNameInputChange}
              />
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Link <span className="text-red-600">*</span>
            </span>
            <Input
              className="w-full"
              type="text"
              placeholder="The full URL of the page you want to get to"
              value={state.shortcutCreate.link}
              onChange={handleLinkInputChange}
            />
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Description</span>
            <Input
              className="w-full"
              type="text"
              placeholder="Something to describe the link"
              value={state.shortcutCreate.description}
              onChange={handleDescriptionInputChange}
            />
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Tags</span>
            <Input className="w-full" type="text" placeholder="Separated by spaces" value={tag} onChange={handleTagsInputChange} />
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">
              Visibility <span className="text-red-600">*</span>
            </span>
            <div className="w-full flex flex-row justify-start items-center text-base">
              <RadioGroup orientation="horizontal" value={state.shortcutCreate.visibility} onChange={handleVisibilityInputChange}>
                <Radio value="PRIVATE" label="Private" />
                <Radio value="WORKSPACE" label="Workspace" />
                <Radio value="PUBLIC" label="Public" />
              </RadioGroup>
            </div>
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
