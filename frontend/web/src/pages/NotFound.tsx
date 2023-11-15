import Icon from "@/components/Icon";

const NotFound = () => {
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-zinc-100 dark:bg-zinc-800">
      <div className="w-full h-full flex flex-col justify-center items-center">
        <Icon.Meh strokeWidth={1} className="w-20 h-auto opacity-80 dark:text-gray-300" />
        <p className="mt-4 mb-8 text-4xl font-mono dark:text-gray-300">404</p>
      </div>
    </div>
  );
};

export default NotFound;
