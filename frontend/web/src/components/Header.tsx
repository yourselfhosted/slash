import { Avatar } from "@mui/joy";
import { useState } from "react";
import { Link } from "react-router-dom";
import * as api from "../helpers/api";
import useUserStore from "../stores/v1/user";
import AboutDialog from "./AboutDialog";
import Icon from "./Icon";
import Dropdown from "./common/Dropdown";

const Header: React.FC = () => {
  const currentUser = useUserStore().getCurrentUser();
  const [showAboutDialog, setShowAboutDialog] = useState<boolean>(false);

  const handleSignOutButtonClick = async () => {
    await api.signout();
    window.location.href = "/auth";
  };

  return (
    <>
      <div className="w-full bg-gray-50 dark:bg-zinc-900 border-b border-b-gray-200 dark:border-b-zinc-800">
        <div className="w-full max-w-6xl mx-auto px-3 md:px-12 py-5 flex flex-row justify-between items-center">
          <div className="flex flex-row justify-start items-center shrink mr-2">
            <Link to="/" className="text-lg cursor-pointer flex flex-row justify-start items-center dark:text-gray-400">
              <img src="/logo.png" className="w-8 h-auto mr-2 -mt-0.5 dark:opacity-80" alt="" />
              Slash
            </Link>
          </div>
          <div className="relative flex-shrink-0">
            <Dropdown
              trigger={
                <button className="flex flex-row justify-end items-center cursor-pointer">
                  <Avatar size="sm" variant="plain" />
                  <span className="dark:text-gray-400">{currentUser.nickname}</span>
                  <Icon.ChevronDown className="ml-2 w-5 h-auto text-gray-600 dark:text-gray-400" />
                </button>
              }
              actionsClassName="!w-32"
              actions={
                <>
                  <Link
                    to="/setting"
                    className="w-full px-2 flex flex-row justify-start items-center text-left dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                  >
                    <Icon.Settings className="w-4 h-auto mr-2" /> Setting
                  </Link>
                  <button
                    className="w-full px-2 flex flex-row justify-start items-center text-left dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                    onClick={() => setShowAboutDialog(true)}
                  >
                    <Icon.Info className="w-4 h-auto mr-2" /> About
                  </button>
                  <button
                    className="w-full px-2 flex flex-row justify-start items-center text-left dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
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
