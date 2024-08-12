import { Tooltip } from "@mui/joy";
import { useWorkspaceStore } from "@/stores";
import { FeatureType } from "@/stores/workspace";
import Icon from "./Icon";

interface Props {
  feature: FeatureType;
  className?: string;
}

const FeatureBadge = ({ feature, className }: Props) => {
  const workspaceStore = useWorkspaceStore();
  const isFeatureEnabled = workspaceStore.checkFeatureAvailable(feature);

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
