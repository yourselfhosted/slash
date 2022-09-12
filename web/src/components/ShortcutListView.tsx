interface Props {
  shortcutList: Shortcut[];
}

const ShortcutListView: React.FC<Props> = (props: Props) => {
  const { shortcutList } = props;

  return (
    <div className="w-full flex flex-col justify-start items-start">
      {shortcutList.map((shortcut) => {
        return (
          <div key={shortcut.id} className="w-full flex flex-col justify-start items-start border px-6 py-4 mb-2 rounded-lg">
            <span className="text-xl font-medium">{shortcut.name}</span>
            <span className="text-base text-gray-600">{shortcut.link}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ShortcutListView;
