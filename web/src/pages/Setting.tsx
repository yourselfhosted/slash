import { useAppSelector } from "../stores";
import AccountSection from "../components/setting/AccountSection";
import WorkspaceSection from "../components/setting/WorkspaceSection";

const Setting: React.FC = () => {
  const user = useAppSelector((state) => state.user).user as User;
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="mx-auto max-w-4xl w-full px-3 py-6 flex flex-col justify-start items-start space-y-4">
      <AccountSection />
      {isAdmin && <WorkspaceSection />}
    </div>
  );
};

export default Setting;
