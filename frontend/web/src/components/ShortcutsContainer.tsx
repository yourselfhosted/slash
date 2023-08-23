import classNames from "classnames";
import useViewStore from "../stores/v1/view";
import ShortcutCard from "./ShortcutCard";
import ShortcutView from "./ShortcutView";

interface Props {
  shortcutList: Shortcut[];
}

const ShortcutsContainer: React.FC<Props> = (props: Props) => {
  const { shortcutList } = props;
  const viewStore = useViewStore();
  const displayStyle = viewStore.displayStyle || "full";
  const ShortcutItemView = viewStore.displayStyle === "compact" ? ShortcutView : ShortcutCard;

  return (
    <div
      className={classNames(
        "w-full grid grid-cols-1 gap-y-2 sm:gap-2",
        displayStyle === "full" ? "sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-4 gap-2"
      )}
    >
      {shortcutList.map((shortcut) => {
        return <ShortcutItemView key={shortcut.id} shortcut={shortcut} />;
      })}
    </div>
  );
};

export default ShortcutsContainer;
