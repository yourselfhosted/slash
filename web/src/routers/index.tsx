import { createBrowserRouter, redirect } from "react-router-dom";
import { isNullorUndefined } from "../helpers/utils";
import { userService } from "../services";
import Root from "../layouts/Root";
import Auth from "../pages/Auth";
import Home from "../pages/Home";
import Account from "../pages/Account";

const router = createBrowserRouter([
  {
    path: "/auth",
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
            return redirect("/auth");
          }
          return null;
        },
      },
      {
        path: "/account",
        element: <Account />,
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
