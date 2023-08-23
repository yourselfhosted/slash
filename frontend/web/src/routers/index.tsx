import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Root from "../layouts/Root";
import Home from "../pages/Home";
import Setting from "../pages/Setting";
import ShortcutDetail from "../pages/ShortcutDetail";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import { shortcutService } from "../services";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "auth",
        element: <SignIn />,
      },
      {
        path: "auth/signup",
        element: <SignUp />,
      },
      {
        path: "",
        element: <Root />,
        children: [
          {
            path: "",
            element: <Home />,
          },
          {
            path: "/shortcut/:shortcutId",
            element: <ShortcutDetail />,
            loader: async ({ params }) => {
              const shortcut = await shortcutService.getOrFetchShortcutById(Number(params.shortcutId));
              return shortcut;
            },
          },
          {
            path: "/setting",
            element: <Setting />,
          },
        ],
      },
    ],
  },
]);

export default router;
