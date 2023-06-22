import { Button } from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store";
import { userService } from "../services";
import ChangePasswordDialog from "../components/ChangePasswordDialog";

interface State {
  showChangePasswordDialog: boolean;
}

const UserDetail: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);
  const [state, setState] = useState<State>({
    showChangePasswordDialog: false,
  });

  console.log("here");
  useEffect(() => {
    if (!userService.getState().user) {
      navigate("/user/auth");
      return;
    }
    console.log("here");
  }, []);

  const handleChangePasswordBtnClick = async () => {
    setState({
      ...state,
      showChangePasswordDialog: true,
    });
  };

  return (
    <>
      <div className="mx-auto max-w-4xl w-full px-3 py-6 flex flex-col justify-start items-start space-y-4">
        <p className="text-3xl mt-2 mb-4">{user?.nickname}</p>
        <p className="leading-8 flex flex-row justify-start items-center">
          <span className="mr-3 text-gray-500 font-mono">Email: </span>
          {user?.email}
        </p>
        <div className="leading-8 flex flex-row justify-start items-center">
          <span className="mr-3 text-gray-500 font-mono">Password: </span>
          <Button variant="soft" onClick={handleChangePasswordBtnClick}>
            Change
          </Button>
        </div>
      </div>

      {state.showChangePasswordDialog && (
        <ChangePasswordDialog
          onClose={() => {
            setState({
              ...state,
              showChangePasswordDialog: false,
            });
          }}
        />
      )}
    </>
  );
};

export default UserDetail;
