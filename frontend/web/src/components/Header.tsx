import { Avatar } from "@mui/joy";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { authServiceClient } from "@/grpcweb";
import useWorkspaceStore from "@/stores/v1/workspace";
import { PlanType } from "@/types/proto/api/v2/subscription_service";
import { Role } from "@/types/proto/api/v2/user_service";
import useUserStore from "../stores/v1/user";
import AboutDialog from "./AboutDialog";
import Icon from "./Icon";
import Dropdown from "./common/Dropdown";

const Header: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const workspaceStore = useWorkspaceStore();
  const currentUser = useUserStore().getCurrentUser();
  const [showAboutDialog, setShowAboutDialog] = useState<boolean>(false);
  const profile = workspaceStore.profile;
  const isAdmin = currentUser.role === Role.ADMIN;
  const shouldShowRouterSwitch = location.pathname === "/" || location.pathname === "/collections";

  const handleSignOutButtonClick = async () => {
    await authServiceClient.signOut({});
    localStorage.removeItem("userId");
    window.location.href = "/auth";
  };

  return (
    <>
      <div className="w-full bg-gray-50 dark:bg-zinc-800 border-b border-b-gray-200 dark:border-b-zinc-800">
        <div className="w-full max-w-8xl mx-auto px-3 md:px-12 py-3 flex flex-row justify-between items-center">
          <div className="flex flex-row justify-start items-center shrink mr-2">
            <Link to="/" className="cursor-pointer flex flex-row justify-start items-center dark:text-gray-400">
              <img id="logo-img" src="/logo.png" className="w-7 h-auto mr-2 -mt-0.5 dark:opacity-80 rounded-full shadow" alt="" />
              Slash
            </Link>
            {profile.plan === PlanType.PRO && (
              <span className="ml-1 text-xs px-1.5 leading-5 border rounded-full bg-blue-600 border-blue-700 text-white shadow dark:opacity-70">
                PRO
              </span>
            )}
            {shouldShowRouterSwitch && (
              <>
                <span className="font-mono opacity-60 mx-1">/</span>
                <Dropdown
                  trigger={
                    <button className="flex flex-row justify-end items-center cursor-pointer">
                      <span className="dark:text-gray-400">{location.pathname === "/" ? "Shortcuts" : "Collections"}</span>
                      <Icon.ChevronsUpDown className="ml-1 w-4 h-auto text-gray-600 dark:text-gray-400" />
                    </button>
                  }
                  actionsClassName="!w-36 -left-4"
                  actions={
                    <>
                      <Link
                        to="/"
                        className="w-full px-2 flex flex-row justify-start items-center text-left dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                      >
                        <Icon.SquareSlash className="w-5 h-auto mr-2 opacity-70" /> Shortcuts
                      </Link>
                      <Link
                        to="/collections"
                        className="w-full px-2 flex flex-row justify-start items-center text-left dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                      >
                        <Icon.LibrarySquare className="w-5 h-auto mr-2 opacity-70" /> Collections
                      </Link>
                    </>
                  }
                ></Dropdown>
              </>
            )}
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
                    to="/setting/general"
                    className="w-full px-2 flex flex-row justify-start items-center text-left dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                  >
                    <Icon.User className="w-4 h-auto mr-2" /> {t("user.profile")}
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/setting/workspace"
                      className="w-full px-2 flex flex-row justify-start items-center text-left dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                    >
                      <Icon.Settings className="w-4 h-auto mr-2" /> {t("settings.self")}
                    </Link>
                  )}
                  <button
                    className="w-full px-2 flex flex-row justify-start items-center text-left dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                    onClick={() => setShowAboutDialog(true)}
                  >
                    <Icon.Info className="w-4 h-auto mr-2" /> {t("common.about")}
                  </button>
                  <button
                    className="w-full px-2 flex flex-row justify-start items-center text-left dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                    onClick={() => handleSignOutButtonClick()}
                  >
                    <Icon.LogOut className="w-4 h-auto mr-2" /> {t("auth.sign-out")}
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
