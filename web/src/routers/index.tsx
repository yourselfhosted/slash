import { createBrowserRouter } from "react-router-dom";
import Root from "../layouts/Root";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import Home from "../pages/Home";
import Setting from "../pages/Setting";
import App from "../App";

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
            path: "/setting",
            element: <Setting />,
          },
        ],
      },
    ],
  },
]);

export default router;
