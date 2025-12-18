import Icon from "@/components/Icon";

const NotFound = () => {
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-muted">
      <div className="w-full h-full flex flex-col justify-center items-center">
        <Icon.Meh strokeWidth={1} className="w-20 h-auto opacity-80 text-muted-foreground" />
        <p className="mt-4 mb-8 text-4xl font-mono text-muted-foreground">404</p>
      </div>
    </div>
  );
};

export default NotFound;
