import { useEffect, useState } from "react";
import { shortcutService } from "../services";
import useLoading from "../hooks/useLoading";
import Icon from "./Icon";
import { generateDialog } from "./Dialog";
import toastHelper from "./Toast";

interface Props extends DialogProps {
  workspaceId: WorkspaceId;
  shortcutId?: ShortcutId;
}

interface State {
  shortcutCreate: ShortcutCreate;
}

const CreateShortcutDialog: React.FC<Props> = (props: Props) => {
  const { destroy, workspaceId, shortcutId } = props;
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
      destroy();
    } catch (error: any) {
      console.error(error);
      toastHelper.error(error.response.data.error || error.response.data.message);
    }
  };

  return (
    <>
      <div className="max-w-full w-80 sm:w-96 flex flex-row justify-between items-center mb-4">
        <p className="text-base">{shortcutId ? "Edit Shortcut" : "Create Shortcut"}</p>
        <button className="rounded p-1 hover:bg-gray-100" onClick={destroy}>
          <Icon.X className="w-5 h-auto text-gray-600" />
        </button>
      </div>
      <div className="w-full flex flex-col justify-start items-start">
        <div className="w-full flex flex-col justify-start items-start mb-3">
          <span className="mb-2">Name</span>
          <input
            className="w-full rounded border shadow-inner text-sm px-2 py-2"
            type="text"
            placeholder="shortcut-name"
            value={state.shortcutCreate.name}
            onChange={handleNameInputChange}
          />
        </div>
        <div className="w-full flex flex-col justify-start items-start mb-3">
          <span className="mb-2">Link</span>
          <input
            className="w-full rounded border shadow-inner text-sm px-2 py-2"
            type="text"
            placeholder="The full URL of the page you want to get to"
            value={state.shortcutCreate.link}
            onChange={handleLinkInputChange}
          />
        </div>
        <div className="w-full flex flex-col justify-start items-start mb-3">
          <span className="mb-2">Description</span>
          <input
            className="w-full rounded border shadow-inner text-sm px-2 py-2"
            type="text"
            placeholder="Something to describe the link"
            value={state.shortcutCreate.description}
            onChange={handleDescriptionInputChange}
          />
        </div>
        <div className="w-full flex flex-col justify-start items-start mb-3">
          <span className="mb-2">Visibility</span>
          <div className="w-full flex flex-row justify-start items-center text-base">
            <input
              type="radio"
              name="visibility"
              id="visibility-private"
              value="PRIVATE"
              onChange={handleVisibilityInputChange}
              checked={state.shortcutCreate.visibility === "PRIVATE"}
            />
            <label htmlFor="visibility-private" className="ml-1 mr-4">
              Private
            </label>
            <input
              type="radio"
              name="visibility"
              id="visibility-workspace"
              value="WORKSPACE"
              onChange={handleVisibilityInputChange}
              checked={state.shortcutCreate.visibility === "WORKSPACE"}
            />
            <label htmlFor="visibility-workspace" className="ml-1 mr-4">
              Workspace
            </label>
            <input
              type="radio"
              name="visibility"
              id="visibility-public"
              value="PUBLIC"
              onChange={handleVisibilityInputChange}
              checked={state.shortcutCreate.visibility === "PUBLIC"}
            />
            <label htmlFor="visibility-public" className="ml-1">
              Public
            </label>
          </div>
        </div>
        <div className="w-full flex flex-row justify-end items-center">
          <button
            className={`rounded px-3 leading-9 shadow bg-green-600 text-white hover:bg-green-700 ${
              requestState.isLoading ? "opacity-80" : ""
            }`}
            onClick={handleSaveBtnClick}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default function showCreateShortcutDialog(workspaceId: WorkspaceId, shortcutId?: ShortcutId): void {
  generateDialog(
    {
      className: "px-2 sm:px-0",
    },
    CreateShortcutDialog,
    {
      workspaceId,
      shortcutId,
    }
  );
}
