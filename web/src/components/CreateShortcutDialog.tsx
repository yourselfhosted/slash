import { Button, Input, Modal, ModalDialog, Radio, RadioGroup } from "@mui/joy";
import { useEffect, useState } from "react";
import { shortcutService } from "../services";
import useLoading from "../hooks/useLoading";
import Icon from "./Icon";
import toastHelper from "./Toast";

interface Props {
  workspaceId: WorkspaceId;
  shortcutId?: ShortcutId;
  onClose: () => void;
  onConfirm?: () => void;
}

interface State {
  shortcutCreate: ShortcutCreate;
}

const CreateShortcutDialog: React.FC<Props> = (props: Props) => {
  const { onClose, onConfirm, workspaceId, shortcutId } = props;
  const [state, setState] = useState<State>({
    shortcutCreate: {
      workspaceId: workspaceId,
      name: "",
      link: "",
      description: "",
      visibility: "PRIVATE",
    },
  });
  const requestState = useLoading(false);

  useEffect(() => {
    if (shortcutId) {
      const shortcutTemp = shortcutService.getShortcutById(shortcutId);
      if (shortcutTemp) {
        setState({
          ...state,
          shortcutCreate: Object.assign(state.shortcutCreate, {
            workspaceId: shortcutTemp.workspaceId,
            name: shortcutTemp.name,
            link: shortcutTemp.link,
            description: shortcutTemp.description,
            visibility: shortcutTemp.visibility,
          }),
        });
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

  const handleVisibilityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e, "visibility");
  };

  const handleSaveBtnClick = async () => {
    if (!state.shortcutCreate.name) {
      toastHelper.error("Name is required");
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
        });
      } else {
        await shortcutService.createShortcut(state.shortcutCreate);
      }

      if (onConfirm) {
        onConfirm();
      } else {
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      toastHelper.error(JSON.stringify(error.response.data));
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
            <span className="mb-2">Name</span>
            <Input
              className="w-full"
              type="text"
              placeholder="shortcut-name"
              value={state.shortcutCreate.name}
              onChange={handleNameInputChange}
            />
          </div>
          <div className="w-full flex flex-col justify-start items-start mb-3">
            <span className="mb-2">Link</span>
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
            <span className="mb-2">Visibility</span>
            <div className="w-full flex flex-row justify-start items-center text-base">
              <RadioGroup row value={state.shortcutCreate.visibility} onChange={handleVisibilityInputChange}>
                <Radio value="PRIVATE" label="Private" />
                <Radio value="WORKSPACE" label="Workspace" />
                <Radio value="PUBLIC" label="Public" />
              </RadioGroup>
            </div>
          </div>
          <div className="w-full flex flex-row justify-end items-center">
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
