import { useColorScheme } from "@mui/joy";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import DemoBanner from "@/components/DemoBanner";
import { useWorkspaceStore } from "@/stores";
import useNavigateTo from "./hooks/useNavigateTo";
import { PlanType } from "./types/proto/api/v1/subscription_service";

function App() {
  const navigateTo = useNavigateTo();
  const { mode: colorScheme } = useColorScheme();
  const workspaceStore = useWorkspaceStore();

  // Redirect to sign up page if no instance owner.
  useEffect(() => {
    if (!workspaceStore.profile.owner) {
      navigateTo("/auth/signup", {
        replace: true,
      });
    }
  }, [workspaceStore.profile]);

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = workspaceStore.setting.customStyle;
    styleEl.setAttribute("type", "text/css");
    document.body.insertAdjacentElement("beforeend", styleEl);
  }, [workspaceStore.setting.customStyle]);

  useEffect(() => {
    const hasCustomBranding = workspaceStore.profile.plan === PlanType.PRO;
    if (!hasCustomBranding || !workspaceStore.setting.branding) {
      return;
    }

    const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    favicon.href = new TextDecoder().decode(workspaceStore.setting.branding);
  }, [workspaceStore.setting.branding]);

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
