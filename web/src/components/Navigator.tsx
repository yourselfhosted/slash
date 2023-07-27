import { uniq } from "lodash-es";
import { Button } from "@mui/joy";
import { useAppSelector } from "../stores";
import useViewStore from "../stores/v1/view";
import Icon from "./Icon";

const Navigator = () => {
  const viewStore = useViewStore();
  const { shortcutList } = useAppSelector((state) => state.shortcut);
  const tags = uniq(shortcutList.map((shortcut) => shortcut.tags).flat());
  const currentTab = viewStore.filter.tab || `tab:all`;
  const sortedTagMap = sortTags(tags);

  return (
    <div className="w-full flex flex-row justify-start items-center gap-1 flex-wrap mb-4">
      <Button
        variant={currentTab === "tab:all" ? "solid" : "plain"}
        color="neutral"
        size="sm"
        onClick={() => viewStore.setFilter({ tab: "tab:all" })}
      >
        <Icon.CircleSlash className="w-4 h-auto mr-1" />
        <span className="font-normal">All</span>
      </Button>
      <Button
        variant={currentTab === "tab:mine" ? "solid" : "plain"}
        color="neutral"
        size="sm"
        onClick={() => viewStore.setFilter({ tab: "tab:mine" })}
      >
        <Icon.User className="w-4 h-auto mr-1" />
        <span className="font-normal">Mine</span>
      </Button>
      {Array.from(sortedTagMap.keys()).map((tag) => (
        <Button
          key={tag}
          variant={currentTab === `tag:${tag}` ? "solid" : "plain"}
          color="neutral"
          size="sm"
          onClick={() => viewStore.setFilter({ tab: `tag:${tag}`, tag: undefined })}
        >
          <Icon.Hash className="w-4 h-auto mr-1" />
          <span className="max-w-[8rem] truncate font-normal">{tag}</span>
        </Button>
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
