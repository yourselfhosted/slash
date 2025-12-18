import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { useShortcutStore, useViewStore } from "@/stores";
import Icon from "./Icon";

const ShortcutsNavigator = () => {
  const { t } = useTranslation();
  const viewStore = useViewStore();
  const shortcutList = useShortcutStore().getShortcutList();
  const tags = shortcutList.map((shortcut) => shortcut.tags).flat();
  const currentTab = viewStore.filter.tab || `tab:all`;
  const sortedTagMap = sortTags(tags);

  return (
    <div className="w-full flex flex-row justify-start items-center mb-4 gap-1 sm:flex-wrap overflow-x-auto no-scrollbar">
      <button
        className={classNames(
          "flex flex-row justify-center items-center px-2 leading-7 text-sm rounded-md",
          currentTab === "tab:all" ? "bg-primary text-primary-foreground shadow" : "text-foreground hover:bg-accent",
        )}
        onClick={() => viewStore.setFilter({ tab: "tab:all" })}
      >
        <Icon.CircleSlash className="w-4 h-auto mr-1" />
        <span className="font-normal">{t("filter.all")}</span>
      </button>
      <button
        className={classNames(
          "flex flex-row justify-center items-center px-2 leading-7 text-sm rounded-md",
          currentTab === "tab:mine" ? "bg-primary text-primary-foreground shadow" : "text-foreground hover:bg-accent",
        )}
        onClick={() => viewStore.setFilter({ tab: "tab:mine" })}
      >
        <Icon.User className="w-4 h-auto mr-1" />
        <span className="font-normal">{t("filter.personal")}</span>
      </button>
      {Array.from(sortedTagMap.keys()).map((tag) => (
        <button
          key={tag}
          className={classNames(
            "flex flex-row justify-center items-center px-2 leading-7 text-sm rounded-md",
            currentTab === `tag:${tag}` ? "bg-primary text-primary-foreground shadow" : "text-foreground hover:bg-accent",
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

export default ShortcutsNavigator;
