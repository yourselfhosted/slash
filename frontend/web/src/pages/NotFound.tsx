import { Button } from "@mui/joy";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CreateShortcutDialog from "@/components/CreateShortcutDialog";
import Icon from "@/components/Icon";
import useNavigateTo from "@/hooks/useNavigateTo";
import useUserStore from "@/stores/v1/user";

interface State {
  showCreateShortcutButton: boolean;
}

const NotFound = () => {
  const location = useLocation();
  const navigateTo = useNavigateTo();
  const currentUser = useUserStore().getCurrentUser();
  const [state, setState] = useState<State>({
    showCreateShortcutButton: false,
  });
  const [showCreateShortcutDialog, setShowCreateShortcutDialog] = useState(false);
  const params = new URLSearchParams(location.search);

  useEffect(() => {
    const shortcut = params.get("shortcut");
    if (currentUser && shortcut) {
      setState({
        ...state,
        showCreateShortcutButton: true,
      });
    }
  }, []);

  return (
    <>
      <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-zinc-100 dark:bg-zinc-800">
        <div className="w-full h-full flex flex-col justify-center items-center">
          <Icon.Meh strokeWidth={1} className="w-20 h-auto opacity-80 dark:text-gray-300" />
          <p className="mt-4 mb-8 text-4xl font-mono dark:text-gray-300">404</p>
          {state.showCreateShortcutButton && (
            <Button
              variant="outlined"
              startDecorator={<Icon.Plus className="w-5 h-auto" />}
              onClick={() => setShowCreateShortcutDialog(true)}
            >
              Create shortcut
            </Button>
          )}
        </div>
      </div>

      {showCreateShortcutDialog && (
        <CreateShortcutDialog
          initialShortcut={{ name: params.get("shortcut") || "" }}
          onClose={() => setShowCreateShortcutDialog(false)}
          onConfirm={() => navigateTo("/")}
        />
      )}
    </>
  );
};

export default NotFound;
