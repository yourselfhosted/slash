import { Tooltip } from "@mui/joy";
import { FeatureType, checkFeatureAvailable } from "@/helpers/feature";
import { useWorkspaceStore } from "@/stores";
import Icon from "./Icon";

interface Props {
  feature: FeatureType;
  className?: string;
}

const FeatureBadge = ({ feature, className }: Props) => {
  const workspaceStore = useWorkspaceStore();
  const isFeatureEnabled = checkFeatureAvailable(feature, workspaceStore.profile.plan);

  if (isFeatureEnabled) {
    return null;
  }
  return (
    <Tooltip title="This feature is not available on your plan." className={className} placement="top" arrow>
      <Icon.Sparkles />
    </Tooltip>
  );
};

export default FeatureBadge;
