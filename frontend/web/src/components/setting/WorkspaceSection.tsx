import { Checkbox } from "@mui/joy";
import { useEffect, useState } from "react";
import { WorkspaceSetting } from "@/types/proto/api/v2/workspace_setting_service";
import { getWorkspaceSetting, updateWorkspaceSetting } from "../../helpers/api";

const WorkspaceSection: React.FC = () => {
  const [workspaceSetting, setWorkspaceSetting] = useState<WorkspaceSetting>();

  useEffect(() => {
    getWorkspaceSetting().then(({ setting }) => {
      setWorkspaceSetting(setting);
    });
  }, []);

  const handleDisallowSignUpChange = async (value: boolean) => {
    const { setting } = await updateWorkspaceSetting(
      {
        ...workspaceSetting,
        enableSignup: value,
      } as WorkspaceSetting,
      ["enable_signup"]
    );
    setWorkspaceSetting(setting);
  };

  if (!workspaceSetting) return <></>;

  return (
    <div className="w-full flex flex-col justify-start items-start space-y-4">
      <p className="text-base font-semibold leading-6 text-gray-900">Workspace settings</p>
      <div className="w-full flex flex-col justify-start items-start">
        <Checkbox
          label="Enable user signup"
          checked={workspaceSetting.enableSignup}
          onChange={(event) => handleDisallowSignUpChange(event.target.checked)}
        />
        <p className="mt-2 text-gray-500">Once enabled, other users can signup.</p>
      </div>
    </div>
  );
};

export default WorkspaceSection;
