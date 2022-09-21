import { createBrowserRouter } from "react-router-dom";
import { userService, workspaceService } from "../services";
import Auth from "../pages/Auth";
import Home from "../pages/Home";
import UserDetail from "../pages/UserDetail";
import WorkspaceDetail from "../pages/WorkspaceDetail";
import ShortcutRedirector from "../pages/ShortcutRedirector";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    loader: async () => {
      try {
        await userService.initialState();
      } catch (error) {
        // do nth
      }
    },
  },
  {
    path: "/user/auth",
    element: <Auth />,
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
    },
  },
  {
    path: "/:workspaceName/go/:shortcutName",
    element: <ShortcutRedirector />,
    loader: async () => {
      try {
        await userService.initialState();
        await workspaceService.fetchWorkspaceList();
      } catch (error) {
        // do nth
      }
    },
  },
]);

export default router;
