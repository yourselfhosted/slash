import { useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/Icon";
import WorkspaceGeneralSettingSection from "@/components/setting/WorkspaceGeneralSettingSection";
import WorkspaceMembersSection from "@/components/setting/WorkspaceMembersSection";
import WorkspaceSecuritySection from "@/components/setting/WorkspaceSecuritySection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUserStore, useWorkspaceStore } from "@/stores";
import { stringifyPlanType } from "@/stores/subscription";
import { Role } from "@/types/proto/api/v1/user_service";

const WorkspaceSetting = () => {
  const workspaceStore = useWorkspaceStore();
  const currentUser = useUserStore().getCurrentUser();
  const isAdmin = currentUser.role === Role.ADMIN;

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
      <Alert variant="default" className="border-primary bg-muted">
        <Icon.Info className="h-4 w-4" />
        <AlertDescription>You can see the settings items below because you are an Admin.</AlertDescription>
      </Alert>
      <div className="w-full flex flex-col">
        <p className="text-2xl shrink-0 font-semibold text-foreground">Subscription</p>
        <div className="mt-2">
          <span className="text-muted-foreground mr-2">Current plan:</span>
          <span className="text-2xl mr-4 text-foreground">{stringifyPlanType(workspaceStore.getSubscription().plan)}</span>
          <Link to="/setting/subscription" viewTransition>
            <Button size="sm" variant="outline">
              <Icon.Settings className="w-4 h-auto mr-2" />
              Manage
            </Button>
          </Link>
        </div>
      </div>
      <Separator />
      <WorkspaceMembersSection />
      <Separator />
      <WorkspaceGeneralSettingSection />
      <Separator />
      <WorkspaceSecuritySection />
    </div>
  );
};

export default WorkspaceSetting;
