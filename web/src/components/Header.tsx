import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store";
import { userService } from "../services";
import Icon from "./Icon";
import Dropdown from "./common/Dropdown";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);

  const handleSignOutButtonClick = async () => {
    await userService.doSignOut();
    navigate("/user/auth");
  };

  return (
    <div className="w-full bg-amber-50">
      <div className="w-full max-w-4xl mx-auto px-3 py-4 flex flex-row justify-between items-center">
        <Link to={"/"} className="text-xl font-mono font-medium cursor-pointer">
          Corgi
        </Link>
        <div className="relative">
          {user ? (
            <Dropdown
              trigger={
                <button className="flex flex-row justify-end items-center cursor-pointer">
                  <span>{user?.name}</span>
                  <Icon.ChevronDown className="ml-1 w-5 h-auto text-gray-600" />
                </button>
              }
              actions={
                <>
                  <Link
                    to={`/user/${user?.id}`}
                    className="w-full px-3 leading-8 text-left cursor-pointer rounded whitespace-nowrap hover:bg-gray-100"
                  >
                    My information
                  </Link>
                  <button
                    className="w-full px-3 leading-8 text-left cursor-pointer rounded whitespace-nowrap hover:bg-gray-100"
                    onClick={() => handleSignOutButtonClick()}
                  >
                    Sign out
                  </button>
                </>
              }
              actionsClassName="!w-36"
            ></Dropdown>
          ) : (
            <span className="cursor-pointer" onClick={() => navigate("/user/auth")}>
              Sign in
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
