import { Button } from "@mui/joy";
import { useState } from "react";
import { useAppSelector } from "../stores";
import ChangePasswordDialog from "../components/ChangePasswordDialog";
import EditUserinfoDialog from "../components/EditUserinfoDialog";

const Account: React.FC = () => {
  const user = useAppSelector((state) => state.user).user as User;
  const [showEditUserinfoDialog, setShowEditUserinfoDialog] = useState<boolean>(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState<boolean>(false);

  return (
    <>
      <div className="mx-auto max-w-4xl w-full px-3 py-6 flex flex-col justify-start items-start space-y-4">
        <p className="text-3xl my-2">{user.nickname}</p>
        <p className="leading-8 flex flex-row justify-start items-center">
          <span className="mr-3 text-gray-500 font-mono">Email: </span>
          {user.email}
        </p>
        <div className="flex flex-row justify-start items-center gap-2">
          <Button variant="outlined" color="neutral" onClick={() => setShowEditUserinfoDialog(true)}>
            Edit
          </Button>
          <Button variant="outlined" color="neutral" onClick={() => setShowChangePasswordDialog(true)}>
            Change password
          </Button>
        </div>
      </div>

      {showEditUserinfoDialog && <EditUserinfoDialog onClose={() => setShowEditUserinfoDialog(false)} />}

      {showChangePasswordDialog && <ChangePasswordDialog onClose={() => setShowChangePasswordDialog(false)} />}
    </>
  );
};

export default Account;
