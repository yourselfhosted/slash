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
        <span className="text-xl font-mono font-medium">Corgi</span>
        <div className="relative">
          <Dropdown
            trigger={
              <div className="flex flex-row justify-end items-center cursor-pointer">
                <span>{user?.name}</span>
                <Icon.ChevronDown className="ml-1 w-5 h-auto text-gray-600" />
              </div>
            }
            actions={
              <>
                <span className="w-full px-2 leading-8 cursor-pointer rounded hover:bg-gray-100" onClick={() => handleSignOutButtonClick()}>
                  Sign out
                </span>
              </>
            }
          ></Dropdown>
        </div>
      </div>
    </div>
  );
};

export default Header;
