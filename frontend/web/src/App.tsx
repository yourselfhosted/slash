import { useColorScheme } from "@mui/joy";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import DemoBanner from "./components/DemoBanner";
import useUserStore from "./stores/v1/user";
import useWorkspaceStore from "./stores/v1/workspace";

function App() {
  const { mode: colorScheme } = useColorScheme();
  const userStore = useUserStore();
  const workspaceStore = useWorkspaceStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([workspaceStore.fetchWorkspaceProfile(), workspaceStore.fetchWorkspaceSetting(), userStore.fetchCurrentUser()]);
      } catch (error) {
        // Do nothing.
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = workspaceStore.setting.customStyle;
    styleEl.setAttribute("type", "text/css");
    document.body.insertAdjacentElement("beforeend", styleEl);
  }, [workspaceStore.setting.customStyle]);

  useEffect(() => {
    const root = document.documentElement;
    if (colorScheme === "light") {
      root.classList.remove("dark");
    } else if (colorScheme === "dark") {
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
  }, [colorScheme]);

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
