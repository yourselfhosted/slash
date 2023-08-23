import AccessTokenSection from "../components/setting/AccessTokenSection";
import AccountSection from "../components/setting/AccountSection";
import MemberSection from "../components/setting/MemberSection";
import WorkspaceSection from "../components/setting/WorkspaceSection";
import useUserStore from "../stores/v1/user";

const Setting: React.FC = () => {
  const currentUser = useUserStore().getCurrentUser();
  const isAdmin = currentUser.role === "ADMIN";

  return (
    <div className="mx-auto max-w-6xl w-full px-3 md:px-12 py-6 flex flex-col justify-start items-start gap-y-12">
      <AccountSection />
      <AccessTokenSection />
      {isAdmin && (
        <>
          <MemberSection />
          <WorkspaceSection />
        </>
      )}
    </div>
  );
};

export default Setting;
