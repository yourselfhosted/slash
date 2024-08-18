import { Button, Option, Select, Textarea } from "@mui/joy";
import { head, isEqual } from "lodash-es";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { workspaceServiceClient } from "@/grpcweb";
import { useWorkspaceStore } from "@/stores";
import { FeatureType } from "@/stores/workspace";
import { Visibility } from "@/types/proto/api/v1/common";
import { WorkspaceSetting } from "@/types/proto/api/v1/workspace_service";
import FeatureBadge from "../FeatureBadge";
import Icon from "../Icon";

const getDefaultVisibility = (visibility?: Visibility) => {
  if (!visibility || [Visibility.VISIBILITY_UNSPECIFIED, Visibility.UNRECOGNIZED].includes(visibility)) {
    // Default to workspace visibility.
    return Visibility.WORKSPACE;
  }
  return visibility;
};

const convertFileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const WorkspaceGeneralSettingSection = () => {
  const { t } = useTranslation();
  const workspaceStore = useWorkspaceStore();
  const [workspaceSetting, setWorkspaceSetting] = useState<WorkspaceSetting>(workspaceStore.setting);
  const originalWorkspaceSetting = useRef<WorkspaceSetting>(workspaceStore.setting);
  const allowSave = !isEqual(originalWorkspaceSetting.current, workspaceSetting);
  const hasCustomBranding = workspaceStore.checkFeatureAvailable(FeatureType.CustomeBranding);
  const branding = hasCustomBranding && workspaceSetting.branding ? new TextDecoder().decode(workspaceSetting.branding) : "";

  const onBrandingChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(event.target.files || []);
    const file = head(files);
    if (!file) {
      return;
    }

    const base64 = await convertFileToBase64(file);
    setWorkspaceSetting({ ...workspaceSetting, branding: new TextEncoder().encode(base64) });
  };

  const handleCustomStyleChange = async (value: string) => {
    setWorkspaceSetting({
      ...workspaceSetting,
      customStyle: value,
    });
  };

  const handleDefaultVisibilityChange = async (value: Visibility) => {
    setWorkspaceSetting({
      ...workspaceSetting,
      defaultVisibility: value,
    });
  };

  const handleSaveWorkspaceSetting = async () => {
    const updateMask: string[] = [];
    if (!isEqual(originalWorkspaceSetting.current.branding, workspaceSetting.branding)) {
      updateMask.push("branding");
    }
    if (!isEqual(originalWorkspaceSetting.current.customStyle, workspaceSetting.customStyle)) {
      updateMask.push("custom_style");
    }
    if (!isEqual(originalWorkspaceSetting.current.defaultVisibility, workspaceSetting.defaultVisibility)) {
      updateMask.push("default_visibility");
    }
    if (updateMask.length === 0) {
      toast.error("No changes made");
      return;
    }

    try {
      const setting = await workspaceServiceClient.updateWorkspaceSetting({
        setting: workspaceSetting,
        updateMask: updateMask,
      });
      setWorkspaceSetting(setting);
      await workspaceStore.fetchWorkspaceSetting();
      originalWorkspaceSetting.current = setting;
      toast.success("Workspace setting saved successfully");
    } catch (error: any) {
      toast.error(error.details);
    }
  };

  return (
    <div className="w-full flex flex-col sm:flex-row justify-start items-start gap-4 sm:gap-x-16">
      <p className="sm:w-1/4 text-2xl shrink-0 font-semibold text-gray-900 dark:text-gray-500">General</p>
      <div className="w-full sm:w-auto grow flex flex-col justify-start items-start gap-4">
        <div className="w-full flex flex-row justify-between items-center">
          <div className="w-full flex flex-col justify-start items-start">
            <p className="flex flex-row justify-start items-center">
              <span className="font-medium dark:text-gray-400">Custom branding</span>
              <FeatureBadge className="w-5 h-auto ml-1 text-blue-600" feature={FeatureType.CustomeBranding} />
            </p>
            <p className="text-sm text-gray-500 leading-tight">Recommand logo ratio: 1:1</p>
          </div>
          <div className="relative shrink-0 hover:opacity-80 flex flex-col items-end justify-center">
            {branding ? (
              <div className="relative w-12 h-12 mr-2">
                <img src={branding} alt="branding" className="max-w-full max-h-full rounded-lg" />
                <Icon.X
                  className="w-4 h-auto -top-2 -right-2 absolute z-10 border rounded-full bg-white opacity-80"
                  onClick={() => setWorkspaceSetting({ ...workspaceSetting, branding: new TextEncoder().encode("") })}
                />
              </div>
            ) : (
              <Icon.CircleSlash className="w-12 h-auto dark:text-gray-500 mr-2" strokeWidth={1} />
            )}
            <input
              className="absolute inset-0 z-1 opacity-0"
              type="file"
              disabled={!hasCustomBranding}
              accept=".jpg,.jpeg,.png,.svg,.webp"
              onChange={onBrandingChange}
            />
            <p className="text-xs opacity-60">(Click to select file)</p>
          </div>
        </div>
        <div className="w-full flex flex-row justify-between items-center">
          <div className="w-full flex flex-col justify-start items-start">
            <p className="font-medium dark:text-gray-400">{t("settings.workspace.default-visibility")}</p>
            <p className="text-sm text-gray-500 leading-tight">The default visibility of new shortcuts/collections.</p>
          </div>
          <Select
            className="w-36"
            defaultValue={getDefaultVisibility(workspaceSetting.defaultVisibility)}
            onChange={(_, value) => handleDefaultVisibilityChange(value as Visibility)}
          >
            <Option value={Visibility.PRIVATE}>{t(`shortcut.visibility.private.self`)}</Option>
            <Option value={Visibility.WORKSPACE}>{t(`shortcut.visibility.workspace.self`)}</Option>
            <Option value={Visibility.PUBLIC}>{t(`shortcut.visibility.public.self`)}</Option>
          </Select>
        </div>
        <div className="w-full flex flex-col justify-start items-start">
          <p className="mt-2 font-medium dark:text-gray-400">{t("settings.workspace.custom-style")}</p>
          <Textarea
            className="w-full mt-2"
            placeholder="* {font-family: ui-monospace Monaco Consolas;}"
            minRows={2}
            maxRows={5}
            value={workspaceSetting.customStyle}
            onChange={(event) => handleCustomStyleChange(event.target.value)}
          />
        </div>
        <div>
          <Button color="primary" disabled={!allowSave} onClick={handleSaveWorkspaceSetting}>
            {t("common.save")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceGeneralSettingSection;
