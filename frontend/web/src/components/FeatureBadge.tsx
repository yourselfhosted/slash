import { Tooltip } from "@mui/joy";
import Icon from "./Icon";

interface Props {
  className?: string;
}

const FeatureBadge = ({ className }: Props) => {
  return (
    <Tooltip title="This feature is not available on your plan." className={className} placement="top" arrow>
      <Icon.Sparkles />
    </Tooltip>
  );
};

export default FeatureBadge;
