import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService, shortcutService } from "../services";
import { useAppSelector } from "../store";
import useLoading from "../hooks/useLoading";
import Icon from "../components/Icon";
import ShortcutListView from "../components/ShortcutListView";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const loadingState = useLoading();
  const { shortcutList } = useAppSelector((state) => state.shortcut);

  useEffect(() => {
    if (!userService.getState().user) {
      navigate("/user/auth");
      return;
    }

    Promise.all([shortcutService.getMyAllShortcuts()]).finally(() => {
      loadingState.setFinish();
    });
  }, []);

  return (
    <>
      <div className="mx-auto max-w-4xl w-full px-3 py-6 flex flex-col justify-start items-start">
        <div className="mb-4 w-full flex flex-row justify-between items-center">
          <span className="font-mono text-gray-400">Workspace List</span>
        </div>
        {loadingState.isLoading ? (
          <div className="py-4 w-full flex flex-row justify-center items-center">
            <Icon.Loader className="mr-2 w-5 h-auto animate-spin" />
            loading
          </div>
        ) : (
          <ShortcutListView shortcutList={shortcutList} />
        )}
      </div>
    </>
  );
};

export default Home;
