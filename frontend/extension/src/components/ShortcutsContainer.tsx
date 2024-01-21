import classNames from "classnames";
import useShortcutStore from "@/store/shortcut";
import Icon from "./Icon";
import ShortcutView from "./ShortcutView";

const ShortcutsContainer = () => {
  const shortcuts = useShortcutStore().getShortcutList();

  return (
    <div>
      <div className="w-full flex flex-row justify-start items-center mb-4">
        <a className="bg-blue-100 dark:bg-blue-500 dark:opacity-70 py-2 px-3 rounded-full border dark:border-blue-600 flex flex-row justify-start items-center cursor-pointer shadow">
          <Icon.AlertCircle className="w-4 h-auto" />
          <span className="mx-1 text-sm">Please make sure you have signed in your instance.</span>
        </a>
      </div>
      <div className={classNames("w-full flex flex-row justify-start items-start flex-wrap gap-2")}>
        {shortcuts.map((shortcut) => {
          return <ShortcutView key={shortcut.id} shortcut={shortcut} />;
        })}
      </div>
    </div>
  );
};

export default ShortcutsContainer;
