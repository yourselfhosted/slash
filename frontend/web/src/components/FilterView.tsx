import { useTranslation } from "react-i18next";
import { useViewStore } from "@/stores";
import Icon from "./Icon";
import VisibilityIcon from "./VisibilityIcon";

const FilterView = () => {
  const { t } = useTranslation();
  const viewStore = useViewStore();
  const filter = viewStore.filter;
  const shouldShowFilters = filter.tag !== undefined || filter.visibility !== undefined;

  if (!shouldShowFilters) {
    return <></>;
  }

  return (
    <div className="w-full flex flex-row justify-start items-center mb-4 pl-2">
      <span className="text-gray-400">Filters:</span>
      {filter.tag && (
        <button
          className="ml-2 px-2 py-1 flex flex-row justify-center items-center bg-gray-100 rounded-full text-gray-500 text-sm hover:line-through"
          onClick={() => viewStore.setFilter({ tag: undefined })}
        >
          <Icon.Tag className="w-4 h-auto mr-1" />
          <span className="max-w-[8rem] truncate">#{filter.tag}</span>
          <Icon.X className="w-4 h-auto ml-1" />
        </button>
      )}
      {filter.visibility && (
        <button
          className="ml-2 px-2 py-1 flex flex-row justify-center items-center bg-gray-100 rounded-full text-gray-500 text-sm hover:line-through"
          onClick={() => viewStore.setFilter({ visibility: undefined })}
        >
          <VisibilityIcon className="w-4 h-auto mr-1" visibility={filter.visibility} />
          {t(`shortcut.visibility.${filter.visibility.toLowerCase()}.self`)}
          <Icon.X className="w-4 h-auto ml-1" />
        </button>
      )}
    </div>
  );
};

export default FilterView;
