import { Button } from "@mui/joy";
import { useState } from "react";
import { useAppSelector } from "../../stores";
import ChangePasswordDialog from "../ChangePasswordDialog";
import EditUserinfoDialog from "../EditUserinfoDialog";

const AccountSection: React.FC = () => {
  const user = useAppSelector((state) => state.user).user as User;
  const [showEditUserinfoDialog, setShowEditUserinfoDialog] = useState<boolean>(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState<boolean>(false);
  const isAdmin = user.role === "ADMIN";

  return (
    <>
      <div className="mx-auto max-w-4xl w-full px-3 py-6 flex flex-col justify-start items-start gap-y-2">
        <p className="text-gray-400">Account</p>
        <p className="flex flex-row justify-start items-center mt-2">
          <span className="text-xl font-medium">{user.nickname}</span>
          {isAdmin && <span className="ml-2 bg-blue-600 text-white px-3 leading-7 text-sm rounded-full">Admin</span>}
        </p>
        <p className="flex flex-row justify-start items-center">
          <span className="mr-3 text-gray-500 font-mono">Email: </span>
          {user.email}
        </p>
        <div className="flex flex-row justify-start items-center gap-2 mt-2">
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

export default AccountSection;
