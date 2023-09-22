import { useColorScheme } from "@mui/joy";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import DemoBanner from "./components/DemoBanner";
import { workspaceServiceClient } from "./grpcweb";
import { workspaceService } from "./services";
import useUserStore from "./stores/v1/user";
import { WorkspaceSetting } from "./types/proto/api/v2/workspace_service";

function App() {
  const { mode } = useColorScheme();
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

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "light") {
      root.classList.remove("dark");
    } else if (mode === "dark") {
      root.classList.add("dark");
    } else {
      const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      if (darkMediaQuery.matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      const handleColorSchemeChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      };
      try {
        darkMediaQuery.addEventListener("change", handleColorSchemeChange);
      } catch (error) {
        console.error("failed to initial color scheme listener", error);
      }

      return () => {
        darkMediaQuery.removeEventListener("change", handleColorSchemeChange);
      };
    }
  }, [mode]);

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
