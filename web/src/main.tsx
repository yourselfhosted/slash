import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./stores";
import App from "./App";
import "./i18n";
import "./css/index.css";

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
