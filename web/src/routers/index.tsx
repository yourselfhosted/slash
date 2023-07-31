import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Root from "../layouts/Root";
import Home from "../pages/Home";
import Setting from "../pages/Setting";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";

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
