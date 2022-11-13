import { CssVarsProvider } from "@mui/joy/styles";
import { RouterProvider } from "react-router-dom";
import router from "./router";

function App() {
  return (
    <CssVarsProvider>
      <RouterProvider router={router} />
    </CssVarsProvider>
  );
}

export default App;
