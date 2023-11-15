import { Divider, Option, Select, Switch } from "@mui/joy";
import { useTranslation } from "react-i18next";
import useViewStore from "../stores/v1/view";
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
              size="sm"
              checked={displayStyle === "compact"}
              onChange={(event) => viewStore.setDisplayStyle(event.target.checked ? "compact" : "full")}
            />
          </div>
          <Divider className="!my-1" />
          <div className="w-full flex flex-row justify-between items-center">
            <span className="text-sm shrink-0 mr-2">{t("filter.order-by")}</span>
            <Select size="sm" value={field} onChange={(_, value) => viewStore.setOrder({ field: value as any })}>
              <Option value={"name"}>Name</Option>
              <Option value={"updatedTs"}>CreatedAt</Option>
              <Option value={"createdTs"}>UpdatedAt</Option>
              <Option value={"view"}>Visits</Option>
            </Select>
          </div>
          <div className="w-full flex flex-row justify-between items-center">
            <span className="text-sm shrink-0 mr-2">{t("filter.direction")}</span>
            <Select size="sm" value={direction} onChange={(_, value) => viewStore.setOrder({ direction: value as any })}>
              <Option value={"asc"}>ASC</Option>
              <Option value={"desc"}>DESC</Option>
            </Select>
          </div>
        </div>
      }
    ></Dropdown>
  );
};

export default ViewSetting;
