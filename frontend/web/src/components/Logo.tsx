import classNames from "classnames";
import { useWorkspaceStore } from "@/stores";
import { PlanType } from "@/types/proto/api/v1/subscription_service";
import Icon from "./Icon";

interface Props {
  className?: string;
}

const Logo = ({ className }: Props) => {
  const workspaceStore = useWorkspaceStore();
  const hasCustomBranding = workspaceStore.profile.subscription?.plan === PlanType.PRO;
  const branding = hasCustomBranding && workspaceStore.setting.branding ? new TextDecoder().decode(workspaceStore.setting.branding) : "";
  return (
    <div className={classNames("w-8 h-auto dark:text-gray-500 rounded-lg overflow-hidden", className)}>
      {branding ? (
        <img src={branding} alt="branding" className="max-w-full max-h-full" />
      ) : (
        <Icon.CircleSlash className="w-full h-auto" strokeWidth={1.5} />
      )}
    </div>
  );
};

export default Logo;
