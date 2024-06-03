import { useColorScheme } from "@mui/joy";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import DemoBanner from "@/components/DemoBanner";
import { useWorkspaceStore } from "@/stores";
import useNavigateTo from "./hooks/useNavigateTo";

function App() {
  const navigateTo = useNavigateTo();
  const { mode: colorScheme } = useColorScheme();
  const workspaceStore = useWorkspaceStore();

  // Redirect to sign up page if no instance owner.
  useEffect(() => {
    if (!workspaceStore.profile.owner) {
      navigateTo("/auth/signup");
    }
  }, [workspaceStore.profile]);

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

  return (
    <>
      <DemoBanner />
      <Outlet />
    </>
  );
}

export default App;
