import useFilterStore from "../stores/v1/filter";
import Icon from "./Icon";

const FilterView = () => {
  const filterStore = useFilterStore();
  const filter = filterStore.filter;
  const shouldShowFilters = filter.tag !== undefined;

  if (!shouldShowFilters) {
    return <></>;
  }

  return (
    <div className="w-full flex flex-row justify-start items-center mb-4 pl-2">
      <span className="text-gray-400">Filters:</span>
      {filter.tag && (
        <button
          className="ml-2 px-2 py-1 flex flex-row justify-center items-center bg-gray-200 rounded-full text-gray-500 text-sm hover:line-through"
          onClick={() => filterStore.setFilter({ tag: undefined })}
        >
          <Icon.Tag className="w-4 h-auto mr-1" />#{filter.tag}
        </button>
      )}
    </div>
  );
};

export default FilterView;
