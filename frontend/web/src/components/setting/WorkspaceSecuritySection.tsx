import { Switch } from "@mui/joy";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
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
      <p className="sm:w-1/4 text-2xl shrink-0 font-semibold text-gray-900 dark:text-gray-500">Security</p>
      <div className="w-full sm:w-auto grow flex flex-col justify-start items-start gap-4">
        <SSOSection />
        <div>
          <Switch
            size="lg"
            checked={workspaceStore.setting.disallowUserRegistration}
            onChange={(event) => toggleDisallowUserRegistration(event.target.checked)}
            endDecorator={<span>{t("settings.workspace.disallow-user-registration.self")}</span>}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSecuritySection;
