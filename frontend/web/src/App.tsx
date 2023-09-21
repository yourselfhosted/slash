import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import DemoBanner from "./components/DemoBanner";
import { workspaceServiceClient } from "./grpcweb";
import { workspaceService } from "./services";
import useUserStore from "./stores/v1/user";
import { WorkspaceSetting } from "./types/proto/api/v2/workspace_service";

function App() {
  const userStore = useUserStore();
  const [workspaceSetting, setWorkspaceSetting] = useState<WorkspaceSetting>(WorkspaceSetting.fromPartial({}));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialState = async () => {
      try {
        await workspaceService.initialState();
      } catch (error) {
        // do nothing
      }

      try {
        const { setting } = await workspaceServiceClient.getWorkspaceSetting({});
        if (setting) {
          setWorkspaceSetting(setting);
        }
      } catch (error) {
        // do nothing
      }

      try {
        await userStore.fetchCurrentUser();
      } catch (error) {
        // do nothing.
      }

      setLoading(false);
    };

    initialState();
  }, []);

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = workspaceSetting.customStyle;
    styleEl.setAttribute("type", "text/css");
    document.body.insertAdjacentElement("beforeend", styleEl);
  }, [workspaceSetting.customStyle]);

  return !loading ? (
    <>
      <DemoBanner />
      <Outlet />
    </>
  ) : (
    <></>
  );
}

export default App;
