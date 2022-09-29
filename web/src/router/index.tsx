import { createBrowserRouter, redirect } from "react-router-dom";
import { isNullorUndefined } from "../helpers/utils";
import { userService, workspaceService } from "../services";
import Auth from "../pages/Auth";
import Home from "../pages/Home";
import UserDetail from "../pages/UserDetail";
import WorkspaceDetail from "../pages/WorkspaceDetail";
import ShortcutRedirector from "../pages/ShortcutRedirector";

const router = createBrowserRouter([
  {
    path: "/user/auth",
    element: <Auth />,
  },
  {
    path: "/",
    element: <Home />,
    loader: async () => {
      try {
        await userService.initialState();
      } catch (error) {
        // do nth
      }

      const { user } = userService.getState();
      if (isNullorUndefined(user)) {
        return redirect("/user/auth");
      }
    },
  },
  {
    path: "/account",
    element: <UserDetail />,
    loader: async () => {
      try {
        await userService.initialState();
      } catch (error) {
        // do nth
      }

      const { user } = userService.getState();
      if (isNullorUndefined(user)) {
        return redirect("/user/auth");
      }
    },
  },
  {
    path: "/:workspaceName",
    element: <WorkspaceDetail />,
    loader: async () => {
      try {
        await userService.initialState();
        await workspaceService.fetchWorkspaceList();
      } catch (error) {
        // do nth
      }

      const { user } = userService.getState();
      if (isNullorUndefined(user)) {
        return redirect("/user/auth");
      }
    },
  },
  {
    path: "/:workspaceName/o/:shortcutName",
    element: <ShortcutRedirector />,
    loader: async () => {
      try {
        await userService.initialState();
        await workspaceService.fetchWorkspaceList();
      } catch (error) {
        // do nth
      }

      const { user } = userService.getState();
      if (isNullorUndefined(user)) {
        return redirect("/user/auth");
      }
    },
  },
]);

export default router;
