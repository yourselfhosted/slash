import { ThemeProvider } from "next-themes";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "./css/index.css";
import "./css/joy-ui.css";
import "./i18n";
import CommonContextProvider from "./layouts/CommonContextProvider";
import router from "./routers";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);

root.render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <CommonContextProvider>
      <RouterProvider router={router} />
    </CommonContextProvider>
    <Toaster />
  </ThemeProvider>,
);
