import { Alert, Button, Divider } from "@mui/joy";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/Icon";
import WorkspaceGeneralSettingSection from "@/components/setting/WorkspaceGeneralSettingSection";
import WorkspaceMembersSection from "@/components/setting/WorkspaceMembersSection";
import WorkspaceSecuritySection from "@/components/setting/WorkspaceSecuritySection";
import { useUserStore, useWorkspaceStore } from "@/stores";
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
      <Alert variant="soft" color="warning" startDecorator={<Icon.Info />}>
        You can see the settings items below because you are an Admin.
      </Alert>

      <WorkspaceMembersSection />
      <Divider />
      <WorkspaceGeneralSettingSection />
      <Divider />
      <WorkspaceSecuritySection />
    </div>
  );
};

export default WorkspaceSetting;
