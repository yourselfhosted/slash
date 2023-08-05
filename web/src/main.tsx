import { CssVarsProvider } from "@mui/joy";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import "./css/index.css";
import "./i18n";
import router from "./routers";
import store from "./stores";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);

root.render(
  <Provider store={store}>
    <CssVarsProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </CssVarsProvider>
  </Provider>
);
