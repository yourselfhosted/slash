import AccountSection from "../components/setting/AccountSection";
import UserSection from "../components/setting/UserSection";
import WorkspaceSection from "../components/setting/WorkspaceSection";
import useUserStore from "../stores/v1/user";

const Setting: React.FC = () => {
  const currentUser = useUserStore().getCurrentUser();
  const isAdmin = currentUser.role === "ADMIN";

  return (
    <div className="mx-auto max-w-4xl w-full px-3 py-6 flex flex-col justify-start items-start space-y-4">
      <AccountSection />
      {isAdmin && (
        <>
          <UserSection />
          <WorkspaceSection />
        </>
      )}
    </div>
  );
};

export default Setting;
