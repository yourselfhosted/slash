import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { authServiceClient } from "@/grpcweb";
import { useWorkspaceStore, useUserStore } from "@/stores";
import { PlanType } from "@/types/proto/api/v1/subscription_service";
import { Role } from "@/types/proto/api/v1/user_service";
import AboutDialog from "./AboutDialog";
import Icon from "./Icon";
import Logo from "./Logo";
import Dropdown from "./common/Dropdown";

const Header: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const workspaceStore = useWorkspaceStore();
  const currentUser = useUserStore().getCurrentUser();
  const [showAboutDialog, setShowAboutDialog] = useState<boolean>(false);
  const subscription = workspaceStore.getSubscription();
  const isAdmin = currentUser.role === Role.ADMIN;
  const shouldShowRouterSwitch = location.pathname === "/shortcuts" || location.pathname === "/collections";
  const selectedSection = location.pathname === "/shortcuts" ? "Shortcuts" : location.pathname === "/collections" ? "Collections" : "";

  const handleSignOutButtonClick = async () => {
    await authServiceClient.signOut({});
    window.location.href = "/auth";
  };

  return (
    <>
      <div className="w-full bg-gray-50 dark:bg-black border-b border-b-gray-200 dark:border-b-zinc-800">
        <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 md:px-12 py-3 flex flex-row justify-between items-center">
          <div className="flex flex-row justify-start items-center shrink mr-2">
            <Link to="/" className="cursor-pointer flex flex-row justify-start items-center dark:text-gray-400" viewTransition>
              <Logo className="mr-2" />
              Slash
            </Link>
            {[PlanType.PRO, PlanType.ENTERPRISE].includes(subscription.plan) && (
              <span className="ml-1 text-xs px-1.5 leading-5 border rounded-full bg-blue-600 border-blue-700 text-white shadow dark:opacity-70">
                {/* PRO or ENT */}
                {subscription.plan.substring(0, 3)}
              </span>
            )}
            {shouldShowRouterSwitch && (
              <>
                <span className="font-mono opacity-60 mx-1 dark:text-gray-400">/</span>
                <Dropdown
                  trigger={
                    <button className="flex flex-row justify-end items-center cursor-pointer">
                      <span className="dark:text-gray-400">{selectedSection}</span>
                      <Icon.ChevronsUpDown className="ml-1 w-4 h-auto text-gray-600 dark:text-gray-400" />
                    </button>
                  }
                  actionsClassName="!w-36 -left-4"
                  actions={
                    <>
                      <Link
                        className="w-full px-2 flex flex-row justify-start items-center text-left dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                        to="/shortcuts"
                        viewTransition
                      >
                        <Icon.SquareSlash className="w-5 h-auto mr-2 opacity-70" /> Shortcuts
                      </Link>
                      <Link
                        className="w-full px-2 flex flex-row justify-start items-center text-left dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                        to="/collections"
                        viewTransition
                      >
                        <Icon.LibrarySquare className="w-5 h-auto mr-2 opacity-70" /> Collections
                      </Link>
                    </>
                  }
                ></Dropdown>
              </>
            )}
          </div>
          <div className="relative shrink-0">
            <Dropdown
              trigger={
                <button className="flex flex-row justify-end items-center cursor-pointer">
                  <span className="dark:text-gray-400 max-w-20 truncate">{currentUser.nickname}</span>
                  <Icon.ChevronDown className="ml-1 w-5 h-auto text-gray-600 dark:text-gray-400" />
                </button>
              }
              actionsClassName="!w-32"
              actions={
                <>
                  <Link
                    className="w-full px-2 flex flex-row justify-start items-center text-left dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                    to="/setting/general"
                    viewTransition
                  >
                    <Icon.User className="w-5 h-auto mr-2 opacity-70" /> {t("user.profile")}
                  </Link>
                  {isAdmin && (
                    <Link
                      className="w-full px-2 flex flex-row justify-start items-center text-left dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                      to="/setting/workspace"
                      viewTransition
                    >
                      <Icon.Settings className="w-5 h-auto mr-2 opacity-70" /> {t("settings.self")}
                    </Link>
                  )}
                  <button
                    className="w-full px-2 flex flex-row justify-start items-center text-left dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                    onClick={() => setShowAboutDialog(true)}
                  >
                    <Icon.Info className="w-5 h-auto mr-2 opacity-70" /> {t("common.about")}
                  </button>
                  <button
                    className="w-full px-2 flex flex-row justify-start items-center text-left dark:text-gray-400 leading-8 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                    onClick={() => handleSignOutButtonClick()}
                  >
                    <Icon.LogOut className="w-5 h-auto mr-2 opacity-70" /> {t("auth.sign-out")}
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
