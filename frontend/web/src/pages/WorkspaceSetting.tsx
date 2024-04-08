import { Alert, Button } from "@mui/joy";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/Icon";
import MemberSection from "@/components/setting/MemberSection";
import WorkspaceSection from "@/components/setting/WorkspaceSection";
import { useUserStore, useWorkspaceStore } from "@/stores";
import { stringifyPlanType } from "@/stores/subscription";
import { Role } from "@/types/proto/api/v1/user_service";

const WorkspaceSetting: React.FC = () => {
  const workspaceStore = useWorkspaceStore();
  const currentUser = useUserStore().getCurrentUser();
  const isAdmin = currentUser.role === Role.ADMIN;
  const profile = workspaceStore.profile;

  useEffect(() => {
    if (!isAdmin) {
      window.location.href = "/";
    }
  }, []);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="mx-auto max-w-8xl w-full px-4 sm:px-6 md:px-12 py-6 flex flex-col justify-start items-start gap-y-12">
      <Alert variant="soft" color="warning" startDecorator={<Icon.Info />}>
        You can see the settings items below because you are an Admin.
      </Alert>
      <div className="w-full flex flex-col">
        <p className="text-2xl shrink-0 font-semibold text-gray-900 dark:text-gray-500">Subscription</p>
        <div className="mt-2">
          <span className="text-gray-500 mr-2">Current plan:</span>
          <span className="text-2xl mr-4 dark:text-gray-400">{stringifyPlanType(profile.plan)}</span>
          <Link to="/setting/subscription" unstable_viewTransition>
            <Button size="sm" variant="outlined" startDecorator={<Icon.Settings className="w-4 h-auto" />}>
              Manage
            </Button>
          </Link>
        </div>
      </div>
      <MemberSection />
      <WorkspaceSection />
    </div>
  );
};

export default WorkspaceSetting;
