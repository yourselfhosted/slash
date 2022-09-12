import { ReactNode, useEffect, useRef } from "react";
import useToggle from "../../hooks/useToggle";
import Icon from "../Icon";
import "../../less/common/dropdown.less";

interface Props {
  trigger?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

const Dropdown: React.FC<Props> = (props: Props) => {
  const { trigger, actions, className } = props;
  const [dropdownStatus, toggleDropdownStatus] = useToggle(false);
  const dropdownWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dropdownStatus) {
      const handleClickOutside = (event: MouseEvent) => {
        if (!dropdownWrapperRef.current?.contains(event.target as Node)) {
          toggleDropdownStatus(false);
        }
      };
      window.addEventListener("click", handleClickOutside, {
        capture: true,
        once: true,
      });
    }
  }, [dropdownStatus]);

  return (
    <div ref={dropdownWrapperRef} className={`dropdown-wrapper ${className ?? ""}`} onClick={() => toggleDropdownStatus()}>
      {trigger ? (
        trigger
      ) : (
        <span className="trigger-button">
          <Icon.MoreHorizontal className="icon-img" />
        </span>
      )}
      <div className={`action-buttons-container ${dropdownStatus ? "" : "!hidden"}`}>{actions}</div>
    </div>
  );
};

export default Dropdown;
