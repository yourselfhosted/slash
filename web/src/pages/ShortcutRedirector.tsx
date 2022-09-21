import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { getShortcutWithNameAndWorkspaceName } from "../helpers/api";
import useLoading from "../hooks/useLoading";
import { userService } from "../services";

interface State {
  errMessage?: string;
}

const ShortcutRedirector: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [state, setState] = useState<State>();
  const loadingState = useLoading();

  useEffect(() => {
    if (!userService.getState().user) {
      navigate("/user/auth");
      return;
    }

    const workspaceName = params.workspaceName || "";
    const shortcutName = params.shortcutName || "";
    getShortcutWithNameAndWorkspaceName(workspaceName, shortcutName)
      .then(({ data: { data: shortcut } }) => {
        if (shortcut) {
          window.location.href = shortcut.link;
        }
      })
      .catch((err) => {
        setState({
          errMessage: err?.message || "Not found",
        });
        loadingState.setFinish();
      });
  }, []);

  return loadingState.isLoading ? null : (
    <div className="w-full h-full flex flex-col justify-start items-start">
      <Header />
      <div className="w-full pt-24 text-center font-mono text-xl">
        <p>{state?.errMessage}</p>
      </div>
    </div>
  );
};

export default ShortcutRedirector;
