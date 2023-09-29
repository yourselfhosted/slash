import { useColorScheme } from "@mui/joy";
import { useEffect } from "react";

const useColorTheme = () => {
  const { mode: colorTheme, setMode: setColorTheme } = useColorScheme();

  useEffect(() => {
    const root = document.documentElement;
    if (colorTheme === "light") {
      root.classList.remove("dark");
    } else if (colorTheme === "dark") {
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
  }, [colorTheme]);

  return { colorTheme, setColorTheme };
};

export default useColorTheme;
