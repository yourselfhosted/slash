import { createBrowserRouter, redirect } from "react-router-dom";
import { isNullorUndefined } from "../helpers/utils";
import { userService } from "../services";
import Root from "../layout/Root";
import Auth from "../pages/Auth";
import Home from "../pages/Home";
import UserDetail from "../pages/UserDetail";

const router = createBrowserRouter([
  {
    path: "/user/auth",
    element: <Auth />,
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
            return redirect("/user/auth");
          }
          return null;
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
          return null;
        },
      },
    ],
  },
]);

export default router;
