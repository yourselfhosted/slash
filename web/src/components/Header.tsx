import { Avatar } from "@mui/joy";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../stores";
import Icon from "./Icon";
import Dropdown from "./common/Dropdown";
import AboutDialog from "./AboutDialog";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user).user as User;
  const [showAboutDialog, setShowAboutDialog] = useState<boolean>(false);

  const handleSignOutButtonClick = async () => {
    navigate("/auth");
  };

  return (
    <>
      <div className="w-full bg-gray-50">
        <div className="w-full max-w-4xl mx-auto px-3 py-5 flex flex-row justify-between items-center">
          <div className="flex flex-row justify-start items-center shrink mr-2">
            <Link to="/" className="text-base font-mono font-medium cursor-pointer flex flex-row justify-start items-center">
              <img src="/logo.png" className="w-8 h-auto mr-2" alt="" />
              Shortify
            </Link>
          </div>
          <div className="relative flex-shrink-0">
            <Dropdown
              trigger={
                <button className="flex flex-row justify-end items-center cursor-pointer">
                  <Avatar size="sm" variant="plain" />
                  <span>{user.nickname}</span>
                  <Icon.ChevronDown className="ml-2 w-5 h-auto text-gray-600" />
                </button>
              }
              actionsClassName="!w-32"
              actions={
                <>
                  <Link
                    to="/setting"
                    className="w-full flex flex-row justify-start items-center px-3 leading-10 text-left cursor-pointer rounded whitespace-nowrap hover:bg-gray-100"
                  >
                    <Icon.Settings className="w-4 h-auto mr-2" /> Setting
                  </Link>
                  <button
                    className="w-full flex flex-row justify-start items-center px-3 leading-10 text-left cursor-pointer rounded whitespace-nowrap hover:bg-gray-100"
                    onClick={() => setShowAboutDialog(true)}
                  >
                    <Icon.Info className="w-4 h-auto mr-2" /> About
                  </button>
                  <button
                    className="w-full flex flex-row justify-start items-center px-3 leading-10 text-left cursor-pointer rounded whitespace-nowrap hover:bg-gray-100"
                    onClick={() => handleSignOutButtonClick()}
                  >
                    <Icon.LogOut className="w-4 h-auto mr-2" /> Sign out
                  </button>
                </>
              }
            ></Dropdown>
          </div>
        </div>
      </div>

      {showAboutDialog && <AboutDialog onClose={() => setShowAboutDialog(false)} />}
    </>
  );
};

export default Header;
