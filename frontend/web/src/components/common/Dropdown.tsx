import { ReactNode } from "react";
import Icon from "@/components/Icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  trigger?: ReactNode;
  actions?: ReactNode;
  className?: string;
  actionsClassName?: string;
}

const Dropdown: React.FC<Props> = (props: Props) => {
  const { trigger, actions, className, actionsClassName } = props;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className} asChild>
        {trigger ? (
          <div>{trigger}</div>
        ) : (
          <button className="flex flex-row justify-center items-center rounded text-muted-foreground hover:text-foreground transition-colors">
            <Icon.MoreVertical className="w-4 h-auto" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className={actionsClassName} align="end">
        {actions}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Dropdown;
