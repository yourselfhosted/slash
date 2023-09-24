import { createBrowserRouter } from "react-router-dom";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import SubscriptionSetting from "@/pages/SubscriptionSetting";
import UserSetting from "@/pages/UserSetting";
import WorkspaceSetting from "@/pages/WorkspaceSetting";
import App from "../App";
import Root from "../layouts/Root";
import Home from "../pages/Home";
import ShortcutDetail from "../pages/ShortcutDetail";
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
            path: "/setting/general",
            element: <UserSetting />,
          },
          {
            path: "/setting/workspace",
            element: <WorkspaceSetting />,
          },
          {
            path: "/setting/subscription",
            element: <SubscriptionSetting />,
          },
        ],
      },
    ],
  },
]);

export default router;
