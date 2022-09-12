import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store";
import { userService } from "../services";
import useToggle from "../hooks/useToggle";
import Icon from "./Icon";
import styles from "../less/header.module.less";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);
  const [showDropdown, toggleShowDropdown] = useToggle(false);

  const handleSignOutButtonClick = async () => {
    await userService.doSignOut();
    navigate("/auth");
  };

  return (
    <div className={styles.header}>
      <div className="w-full max-w-4xl mx-auto px-3 py-4 flex flex-row justify-between items-center">
        <span>Corgi</span>
        <div className="relative">
          <div className="flex flex-row justify-end items-center" onClick={() => toggleShowDropdown()}>
            <span>{user?.name}</span>
            <Icon.ChevronDown className="ml-1 w-5 h-auto text-gray-600" />
          </div>
          <div
            className={`bg-white flex flex-col justify-start items-start p-1 w-32 absolute top-8 right-0 shadow rounded ${
              showDropdown ? "" : "hidden"
            }`}
          >
            <span className="w-full px-2 leading-8 cursor-pointer rounded hover:bg-gray-100" onClick={() => handleSignOutButtonClick()}>
              Sign out
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
