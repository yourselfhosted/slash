import Icon from "./Icon";

interface Props {
  visibility: Visibility;
  className?: string;
}

const VisibilityIcon = (props: Props) => {
  const { visibility, className } = props;
  if (visibility === "PRIVATE") {
    return <Icon.Lock className={className || ""} />;
  } else if (visibility === "WORKSPACE") {
    return <Icon.Building2 className={className || ""} />;
  } else if (visibility === "PUBLIC") {
    return <Icon.Globe2 className={className || ""} />;
  }
  return null;
};

export default VisibilityIcon;
