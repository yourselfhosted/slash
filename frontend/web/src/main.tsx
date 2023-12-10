import "@fontsource/inter";
import { CssVarsProvider } from "@mui/joy";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import "./css/index.css";
import "./css/joy-ui.css";
import "./i18n";
import router from "./routers";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);

root.render(
  <CssVarsProvider>
    <RouterProvider router={router} />
    <Toaster position="top-center" />
  </CssVarsProvider>
);
