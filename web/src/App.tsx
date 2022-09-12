import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { userService, workspaceService } from "./services";
import useLoading from "./hooks/useLoading";
import Only from "./components/common/OnlyWhen";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import WorkspaceDetail from "./pages/WorkspaceDetail";

function App() {
  const navigate = useNavigate();
  const pageLoadingStatus = useLoading();

  useEffect(() => {
    userService.initialState().finally(() => {
      if (!userService.getState().user) {
        pageLoadingStatus.setFinish();
        navigate("/auth");
        return;
      }

      Promise.all([workspaceService.fetchWorkspaceList()]).finally(() => {
        pageLoadingStatus.setFinish();
      });
    });
  }, []);

  return (
    <Only when={!pageLoadingStatus.isLoading}>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/workspace/:workspaceId" element={<WorkspaceDetail />} />
      </Routes>
    </Only>
  );
}

export default App;
