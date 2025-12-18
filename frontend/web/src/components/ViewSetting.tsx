import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useViewStore } from "@/stores";
import Icon from "./Icon";
import Dropdown from "./common/Dropdown";

const ViewSetting = () => {
  const { t } = useTranslation();
  const viewStore = useViewStore();
  const order = viewStore.getOrder();
  const { field, direction } = order;
  const displayStyle = viewStore.displayStyle || "full";

  return (
    <Dropdown
      trigger={
        <button>
          <Icon.Settings2 className="w-4 h-auto text-gray-500" />
        </button>
      }
      actionsClassName="!mt-3 !right-[unset] -left-24 -ml-2"
      actions={
        <div className="w-52 p-2 gap-2 flex flex-col justify-start items-start" onClick={(e) => e.stopPropagation()}>
          <div className="w-full flex flex-row justify-between items-center">
            <span className="text-sm shrink-0 mr-2">{t("filter.compact-mode")}</span>
            <Switch
              checked={displayStyle === "compact"}
              onCheckedChange={(checked) => viewStore.setDisplayStyle(checked ? "compact" : "full")}
            />
          </div>
          <Separator className="!my-1" />
          <div className="w-full flex flex-row justify-between items-center">
            <span className="text-sm shrink-0 mr-2">{t("filter.order-by")}</span>
            <Select value={field} onValueChange={(value) => viewStore.setOrder({ field: value as any })}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="updatedTs">CreatedAt</SelectItem>
                <SelectItem value="createdTs">UpdatedAt</SelectItem>
                <SelectItem value="view">Visits</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full flex flex-row justify-between items-center">
            <span className="text-sm shrink-0 mr-2">{t("filter.direction")}</span>
            <Select value={direction} onValueChange={(value) => viewStore.setOrder({ direction: value as any })}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">ASC</SelectItem>
                <SelectItem value="desc">DESC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      }
    ></Dropdown>
  );
};

export default ViewSetting;
