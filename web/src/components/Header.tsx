import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store";
import { userService } from "../services";
import Icon from "./Icon";
import Dropdown from "./common/Dropdown";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);

  const handleSignOutButtonClick = async () => {
    await userService.doSignOut();
    navigate("/auth");
  };

  return (
    <div className="w-full bg-amber-50">
      <div className="w-full max-w-4xl mx-auto px-3 py-4 flex flex-row justify-between items-center">
        <span className="text-xl font-mono font-medium cursor-pointer" onClick={() => navigate("/")}>
          Corgi
        </span>
        <div className="relative">
          {user ? (
            <Dropdown
              trigger={
                <div className="flex flex-row justify-end items-center cursor-pointer">
                  <span>{user?.name}</span>
                  <Icon.ChevronDown className="ml-1 w-5 h-auto text-gray-600" />
                </div>
              }
              actions={
                <>
                  <span
                    className="w-full px-3 leading-8 cursor-pointer rounded whitespace-nowrap hover:bg-gray-100"
                    onClick={() => navigate(`/user/${user?.id}`)}
                  >
                    My information
                  </span>
                  <span
                    className="w-full px-3 leading-8 cursor-pointer rounded whitespace-nowrap hover:bg-gray-100"
                    onClick={() => handleSignOutButtonClick()}
                  >
                    Sign out
                  </span>
                </>
              }
              actionsClassName="!w-36"
            ></Dropdown>
          ) : (
            <span className="cursor-pointer" onClick={() => navigate("/auth")}>
              Sign in
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
