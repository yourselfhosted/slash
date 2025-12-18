import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { workspaceServiceClient } from "@/grpcweb";
import { useWorkspaceStore } from "@/stores";
import { WorkspaceSetting } from "@/types/proto/api/v1/workspace_service";
import SSOSection from "./SSOSection";

const WorkspaceSecuritySection = () => {
  const { t } = useTranslation();
  const workspaceStore = useWorkspaceStore();

  const toggleDisallowUserRegistration = async (on: boolean) => {
    if (on) {
      const confirmed = window.confirm("Are you sure to disallow user registration? This will prevent new users from signing up.");
      if (!confirmed) {
        return;
      }
    }

    await updateWorkspaceSetting(
      WorkspaceSetting.fromPartial({
        disallowUserRegistration: on,
      }),
      ["disallow_user_registration"],
    );
  };

  const toggleDisallowPasswordAuth = async (on: boolean) => {
    if (on) {
      const confirmed = window.confirm("Are you sure to disallow password auth? This will prevent users from signing in with password.");
      if (!confirmed) {
        return;
      }
    }

    await updateWorkspaceSetting(
      WorkspaceSetting.fromPartial({
        disallowPasswordAuth: on,
      }),
      ["disallow_password_auth"],
    );
  };

  const updateWorkspaceSetting = async (workspaceSetting: WorkspaceSetting, updateMask: string[]) => {
    if (updateMask.length === 0) {
      toast.error("No changes made");
      return;
    }

    try {
      await workspaceServiceClient.updateWorkspaceSetting({
        setting: workspaceSetting,
        updateMask: updateMask,
      });
      await workspaceStore.fetchWorkspaceSetting();
      toast.success("Workspace setting saved successfully");
    } catch (error: any) {
      toast.error(error.details);
    }
  };

  return (
    <div className="w-full flex flex-col sm:flex-row justify-start items-start gap-4 sm:gap-x-16">
      <p className="sm:w-1/4 text-2xl shrink-0 font-semibold text-foreground">Security</p>
      <div className="w-full sm:w-auto grow flex flex-col justify-start items-start gap-4">
        <SSOSection />
        <div className="flex items-center space-x-2">
          <Switch
            id="disallow-user-registration"
            checked={workspaceStore.setting.disallowUserRegistration}
            onCheckedChange={toggleDisallowUserRegistration}
          />
          <Label htmlFor="disallow-user-registration" className="text-foreground">
            {t("settings.workspace.disallow-user-registration.self")}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="disallow-password-auth"
            checked={workspaceStore.setting.disallowPasswordAuth}
            onCheckedChange={toggleDisallowPasswordAuth}
          />
          <Label htmlFor="disallow-password-auth" className="text-foreground">
            {"Disallow password auth"}
          </Label>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSecuritySection;
