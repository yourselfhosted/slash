import { CssVarsProvider } from "@mui/joy";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/sonner";
import { RouterProvider } from "react-router-dom";
import "./css/index.css";
import "./css/joy-ui.css";
import "./i18n";
import CommonContextProvider from "./layouts/CommonContextProvider";
import router from "./routers";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);

root.render(
  <CssVarsProvider>
    <CommonContextProvider>
      <RouterProvider router={router} />
    </CommonContextProvider>
    <Toaster />
  </CssVarsProvider>,
);
