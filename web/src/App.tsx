import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { userService, workspaceService } from "./services";
import useLoading from "./hooks/useLoading";
import Only from "./components/common/OnlyWhen";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import WorkspaceDetail from "./pages/WorkspaceDetail";
import UserDetail from "./pages/UserDetail";
import ShortcutRedirector from "./pages/ShortcutRedirector";

const pathnameWhitelist = [/\/.+?\/go\/.+/];

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const pageLoadingStatus = useLoading();

  useEffect(() => {
    let needAuth = true;

    for (const regexp of pathnameWhitelist) {
      if (regexp.test(location.pathname)) {
        needAuth = false;
        break;
      }
    }
    if (!needAuth) {
      pageLoadingStatus.setFinish();
      return;
    }

    userService.initialState().finally(() => {
      if (!userService.getState().user) {
        pageLoadingStatus.setFinish();
        navigate("/user/auth");
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
        <Route path="/user/auth" element={<Auth />} />
        <Route path="/account/" element={<UserDetail />} />
        <Route path="/:workspaceName" element={<WorkspaceDetail />} />
        <Route path="/:workspaceName/go/:shortcutName" element={<ShortcutRedirector />} />
      </Routes>
    </Only>
  );
}

export default App;
