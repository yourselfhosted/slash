import { createBrowserRouter, redirect } from "react-router-dom";
import { isNullorUndefined } from "../helpers/utils";
import { globalService, userService } from "../services";
import Root from "../layouts/Root";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import Home from "../pages/Home";
import Setting from "../pages/Setting";

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <SignIn />,
    loader: async () => {
      try {
        await globalService.initialState();
      } catch (error) {
        // do nth
      }

      return null;
    },
  },
  {
    path: "/auth/signup",
    element: <SignUp />,
    loader: async () => {
      try {
        await globalService.initialState();
      } catch (error) {
        // do nth
      }

      const {
        workspaceProfile: { disallowSignUp },
      } = globalService.getState();
      if (disallowSignUp) {
        return redirect("/auth");
      }

      return null;
    },
  },
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "",
        element: <Home />,
        loader: async () => {
          try {
            await userService.initialState();
          } catch (error) {
            // do nth
          }

          const { user } = userService.getState();
          if (isNullorUndefined(user)) {
            return redirect("/auth");
          }
          return null;
        },
      },
      {
        path: "/setting",
        element: <Setting />,
        loader: async () => {
          try {
            await userService.initialState();
          } catch (error) {
            // do nth
          }

          const { user } = userService.getState();
          if (isNullorUndefined(user)) {
            return redirect("/auth");
          }
          return null;
        },
      },
    ],
  },
]);

export default router;
