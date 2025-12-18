import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild className={className}>
          <Icon.Sparkles />
        </TooltipTrigger>
        <TooltipContent>This feature is not available on your plan.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FeatureBadge;
