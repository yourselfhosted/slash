import { Visibility } from "@/types/proto/api/v1/common";
import Icon from "./Icon";

interface Props {
  visibility: Visibility;
  className?: string;
}

const VisibilityIcon = (props: Props) => {
  const { visibility, className } = props;
  if (visibility === Visibility.PRIVATE) {
    return <Icon.Lock className={className || ""} />;
  } else if (visibility === Visibility.WORKSPACE) {
    return <Icon.Building2 className={className || ""} />;
  } else if (visibility === Visibility.PUBLIC) {
    return <Icon.Globe2 className={className || ""} />;
  }
  return null;
};

export default VisibilityIcon;
