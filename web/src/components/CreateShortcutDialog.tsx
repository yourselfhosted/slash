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

const CreateShortcutDialog: React.FC<Props> = (props: Props) => {
  const { destroy, workspaceId, shortcutId } = props;
  const [name, setName] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const requestState = useLoading(false);

  useEffect(() => {
    if (shortcutId) {
      const shortcutTemp = shortcutService.getShortcutById(shortcutId);
      if (shortcutTemp) {
        setName(shortcutTemp.name);
        setLink(shortcutTemp.link);
      }
    }
  }, [shortcutId]);

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setName(text);
  };

  const handleLinkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setLink(text);
  };

  const handleVisibilityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setVisibility(text as Visibility);
  };

  const handleSaveBtnClick = async () => {
    if (!name) {
      toastHelper.error("Name is required");
      return;
    }

    try {
      if (shortcutId) {
        await shortcutService.patchShortcut({
          id: shortcutId,
          name,
          link,
        });
      } else {
        await shortcutService.createShortcut({
          workspaceId,
          name,
          link,
          visibility: "PRIVATE",
        });
      }
    } catch (error: any) {
      console.error(error);
      toastHelper.error(error.response.data.message);
    }
    destroy();
  };

  return (
    <>
      <div className="max-w-full w-80 flex flex-row justify-between items-center mb-4">
        <p className="text-base">{shortcutId ? "Edit Shortcut" : "Create Shortcut"}</p>
        <button className="rounded p-1 hover:bg-gray-100" onClick={destroy}>
          <Icon.X className="w-5 h-auto text-gray-600" />
        </button>
      </div>
      <div className="w-full flex flex-col justify-start items-start">
        <div className="w-full flex flex-col justify-start items-start mb-3">
          <span className="mb-2">Name</span>
          <input className="w-full rounded border px-2 py-2" type="text" value={name} onChange={handleNameInputChange} />
        </div>
        <div className="w-full flex flex-col justify-start items-start mb-3">
          <span className="mb-2">Link</span>
          <input className="w-full rounded border px-2 py-2" type="text" value={link} onChange={handleLinkInputChange} />
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
              checked={visibility === "PRIVATE"}
            />
            <label htmlFor="visibility-private" className="ml-1 mr-4">
              Only for myself
            </label>
            <input
              type="radio"
              name="visibility"
              id="visibility-workspace"
              value="WORKSPACE"
              onChange={handleVisibilityInputChange}
              checked={visibility === "WORKSPACE"}
            />
            <label htmlFor="visibility-workspace" className="ml-1">
              Public in workspace
            </label>
          </div>
        </div>
        <div className="w-full flex flex-row justify-end items-center">
          <button
            className={`border rounded px-3 py-2 border-green-600 bg-green-600 text-white hover:bg-green-700 ${
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
