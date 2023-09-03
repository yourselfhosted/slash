import { Button, IconButton, Input, Modal, ModalDialog } from "@mui/joy";
import { useStorage } from "@plasmohq/storage/hook";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { CreateShortcutResponse, OpenGraphMetadata, Visibility } from "@/types/proto/api/v2/shortcut_service_pb";
import Icon from "./Icon";

const generateTempName = (length = 6) => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

interface State {
  name: string;
  title: string;
  link: string;
}

const CreateShortcutsButton = () => {
  const [domain] = useStorage("domain");
  const [accessToken] = useStorage("access_token");
  const [shortcuts, setShortcuts] = useStorage("shortcuts");
  const [state, setState] = useState<State>({
    name: "",
    title: "",
    link: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal) {
      document.body.style.height = "384px";
    } else {
      document.body.style.height = "auto";
    }
  }, [showModal]);

  const handleCreateShortcutButtonClick = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs.length === 0) {
        toast.error("No active tab found");
        return;
      }
      const tab = tabs[0];
      setState((state) => ({
        ...state,
        name: generateTempName().toLowerCase() + "-temp",
        title: tab.title || "",
        link: tab.url || "",
      }));
      setShowModal(true);
    });
  };

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((state) => ({
      ...state,
      name: e.target.value,
    }));
  };

  const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((state) => ({
      ...state,
      title: e.target.value,
    }));
  };

  const handleLinkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((state) => ({
      ...state,
      link: e.target.value,
    }));
  };

  const handleSaveBtnClick = async () => {
    if (isLoading) {
      return;
    }
    if (!state.name) {
      toast.error("Name is required");
      return;
    }

    setIsLoading(true);
    try {
      const {
        data: { shortcut },
      } = await axios.post<CreateShortcutResponse>(
        `${domain}/api/v2/shortcuts`,
        {
          name: state.name,
          title: state.title,
          link: state.link,
          visibility: Visibility.PRIVATE,
          ogMetadata: OpenGraphMetadata.fromJsonString("{}"),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setShortcuts([shortcut, ...shortcuts]);
      toast.success("Shortcut created successfully");
      setShowModal(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response.data.message);
    }
    setIsLoading(false);
  };

  return (
    <>
      <IconButton color="primary" variant="solid" size="sm" onClick={() => handleCreateShortcutButtonClick()}>
        <Icon.Plus className="w-5 h-auto" />
      </IconButton>

      <Modal container={() => document.body} open={showModal} onClose={() => setShowModal(false)}>
        <ModalDialog className="w-3/4">
          <div className="w-full flex flex-row justify-between items-center mb-2">
            <span className="text-base font-medium">Create Shortcut</span>
            <Button size="sm" variant="plain" onClick={() => setShowModal(false)}>
              <Icon.X className="w-5 h-auto text-gray-600" />
            </Button>
          </div>
          <div className="overflow-x-hidden w-full flex flex-col justify-start items-center">
            <div className="w-full flex flex-row justify-start items-center mb-2">
              <span className="block w-12 mr-2 shrink-0">Name</span>
              <Input className="grow" type="text" placeholder="Unique shortcut name" value={state.name} onChange={handleNameInputChange} />
            </div>
            <div className="w-full flex flex-row justify-start items-center mb-2">
              <span className="block w-12 mr-2 shrink-0">Title</span>
              <Input className="grow" type="text" placeholder="Shortcut title" value={state.title} onChange={handleTitleInputChange} />
            </div>
            <div className="w-full flex flex-row justify-start items-center mb-2">
              <span className="block w-12 mr-2 shrink-0">Link</span>
              <Input
                className="grow"
                type="text"
                placeholder="https://github.com/boojack/slash"
                value={state.link}
                onChange={handleLinkInputChange}
              />
            </div>

            <div className="w-full flex flex-row justify-end items-center mt-2 space-x-2">
              <Button color="neutral" variant="plain" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button color="primary" disabled={isLoading} loading={isLoading} onClick={handleSaveBtnClick}>
                Save
              </Button>
            </div>
          </div>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default CreateShortcutsButton;
