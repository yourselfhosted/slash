import classNames from "classnames";
import { useAppSelector } from "../stores";
import useViewStore from "../stores/v1/view";
import Icon from "./Icon";

const Navigator = () => {
  const viewStore = useViewStore();
  const { shortcutList } = useAppSelector((state) => state.shortcut);
  const tags = shortcutList.map((shortcut) => shortcut.tags).flat();
  const currentTab = viewStore.filter.tab || `tab:all`;
  const sortedTagMap = sortTags(tags);

  return (
    <div className="w-full flex flex-row justify-start items-center mb-4 gap-1 sm:flex-wrap overflow-x-auto no-scrollbar">
      <button
        className={classNames(
          "flex flex-row justify-center items-center px-2 leading-7 text-sm rounded-md hover:bg-gray-200",
          currentTab === "tab:all" ? "!bg-gray-600 text-white shadow" : ""
        )}
        onClick={() => viewStore.setFilter({ tab: "tab:all" })}
      >
        <Icon.CircleSlash className="w-4 h-auto mr-1" />
        <span className="font-normal">All</span>
      </button>
      <button
        className={classNames(
          "flex flex-row justify-center items-center px-2 leading-7 text-sm rounded-md hover:bg-gray-200",
          currentTab === "tab:mine" ? "!bg-gray-600 text-white shadow" : ""
        )}
        onClick={() => viewStore.setFilter({ tab: "tab:mine" })}
      >
        <Icon.User className="w-4 h-auto mr-1" />
        <span className="font-normal">Mine</span>
      </button>
      {Array.from(sortedTagMap.keys()).map((tag) => (
        <button
          key={tag}
          className={classNames(
            "flex flex-row justify-center items-center px-2 leading-7 text-sm rounded-md hover:bg-gray-200",
            currentTab === `tag:${tag}` ? "!bg-gray-600 text-white shadow" : ""
          )}
          onClick={() => viewStore.setFilter({ tab: `tag:${tag}`, tag: undefined })}
        >
          <Icon.Hash className="w-4 h-auto mr-0.5" />
          <span className="max-w-[8rem] truncate font-normal">{tag}</span>
        </button>
      ))}
    </div>
  );
};

const sortTags = (tags: string[]): Map<string, number> => {
  const map = new Map<string, number>();
  for (const tag of tags) {
    const count = map.get(tag) || 0;
    map.set(tag, count + 1);
  }
  const sortedMap = new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
  return sortedMap;
};

export default Navigator;
