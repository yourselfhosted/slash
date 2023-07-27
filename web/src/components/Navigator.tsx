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
      {tags.map((tag) => (
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

export default Navigator;
