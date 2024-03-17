import classNames from "classnames";
import Icon from "./Icon";

interface Props {
  className?: string;
}

const Logo = ({ className }: Props) => {
  return <Icon.CircleSlash className={classNames("dark:text-gray-500", className)} strokeWidth={1.5} />;
};

export default Logo;
