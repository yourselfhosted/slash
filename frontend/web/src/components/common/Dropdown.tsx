import { ReactNode, useEffect, useRef, useState } from "react";
import Icon from "../Icon";

interface Props {
  trigger?: ReactNode;
  actions?: ReactNode;
  className?: string;
  actionsClassName?: string;
}

const Dropdown: React.FC<Props> = (props: Props) => {
  const { trigger, actions, className, actionsClassName } = props;
  const [dropdownStatus, setDropdownStatus] = useState(false);
  const dropdownWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dropdownStatus) {
      const handleClickOutside = (event: MouseEvent) => {
        if (!dropdownWrapperRef.current?.contains(event.target as Node)) {
          setDropdownStatus(false);
        }
      };

      window.addEventListener("click", handleClickOutside, {
        capture: true,
      });
      return () => {
        window.removeEventListener("click", handleClickOutside, {
          capture: true,
        });
      };
    }
  }, [dropdownStatus]);

  const handleToggleDropdownStatus = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    setDropdownStatus(!dropdownStatus);
  };

  return (
    <div
      ref={dropdownWrapperRef}
      className={`relative flex flex-col justify-start items-start select-none ${className ?? ""}`}
      onClick={handleToggleDropdownStatus}
    >
      {trigger ? (
        trigger
      ) : (
        <button className="flex flex-row justify-center items-center rounded text-gray-400 cursor-pointer hover:text-gray-500">
          <Icon.MoreVertical className="w-4 h-auto" />
        </button>
      )}
      <div
        className={`w-auto mt-1 absolute top-full right-0 flex flex-col justify-start items-start bg-white dark:bg-zinc-900 z-1 border dark:border-zinc-800 p-1 rounded-md shadow ${
          actionsClassName ?? ""
        } ${dropdownStatus ? "" : "!hidden"}`}
      >
        {actions}
      </div>
    </div>
  );
};

export default Dropdown;
