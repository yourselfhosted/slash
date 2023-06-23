import { CssVarsProvider } from "@mui/joy/styles";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import router from "./routers";

function App() {
  return (
    <CssVarsProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </CssVarsProvider>
  );
}

export default App;
