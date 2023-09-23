import { Button, Checkbox, Textarea } from "@mui/joy";
import { isEqual } from "lodash-es";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { workspaceServiceClient } from "@/grpcweb";
import { releaseGuard } from "@/helpers/utils";
import { WorkspaceSetting } from "@/types/proto/api/v2/workspace_service";

const WorkspaceSection: React.FC = () => {
  const [workspaceSetting, setWorkspaceSetting] = useState<WorkspaceSetting>(WorkspaceSetting.fromPartial({}));
  const originalWorkspaceSetting = useRef<WorkspaceSetting>(WorkspaceSetting.fromPartial({}));
  const allowSave = !isEqual(originalWorkspaceSetting.current, workspaceSetting);

  useEffect(() => {
    workspaceServiceClient.getWorkspaceSetting({}).then(({ setting }) => {
      if (setting) {
        setWorkspaceSetting(setting);
        originalWorkspaceSetting.current = setting;
      }
    });
  }, []);

  const handleEnableSignUpChange = async (value: boolean) => {
    setWorkspaceSetting({
      ...workspaceSetting,
      enableSignup: value,
    });
  };

  const handleCustomStyleChange = async (value: string) => {
    setWorkspaceSetting({
      ...workspaceSetting,
      customStyle: value,
    });
  };

  const handleSaveWorkspaceSetting = async () => {
    const updateMask: string[] = [];
    if (!isEqual(originalWorkspaceSetting.current.enableSignup, workspaceSetting.enableSignup)) {
      updateMask.push("enable_signup");
    }
    if (!isEqual(originalWorkspaceSetting.current.customStyle, workspaceSetting.customStyle)) {
      updateMask.push("custom_style");
    }
    if (updateMask.length === 0) {
      toast.error("No changes made");
      return;
    }

    try {
      const setting = (
        await workspaceServiceClient.updateWorkspaceSetting({
          setting: workspaceSetting,
          updateMask: updateMask,
        })
      ).setting as WorkspaceSetting;
      setWorkspaceSetting(setting);
      originalWorkspaceSetting.current = setting;
      toast.success("Workspace setting saved successfully");
    } catch (error: any) {
      toast.error(error.details);
    }
  };

  return (
    <div className="w-full flex flex-col justify-start items-start space-y-4">
      <p className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-500">Workspace settings</p>
      {releaseGuard() && (
        <div className="w-full flex flex-col justify-start items-start">
          <p className="mt-2 dark:text-gray-400">Custom style</p>
          <Textarea
            className="w-full mt-2"
            minRows={2}
            maxRows={5}
            value={workspaceSetting.customStyle}
            onChange={(event) => handleCustomStyleChange(event.target.value)}
          />
        </div>
      )}
      <div className="w-full flex flex-col justify-start items-start">
        <Checkbox
          label="Enable user signup"
          checked={workspaceSetting.enableSignup}
          onChange={(event) => handleEnableSignUpChange(event.target.checked)}
        />
        <p className="mt-2 text-gray-500">Once enabled, other users can signup.</p>
      </div>
      <div>
        <Button variant="outlined" color="neutral" disabled={!allowSave} onClick={handleSaveWorkspaceSetting}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default WorkspaceSection;
