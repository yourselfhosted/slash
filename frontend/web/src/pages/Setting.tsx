import { Divider } from "@mui/joy";
import PreferenceSection from "@/components/setting/PreferenceSection";
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
      <PreferenceSection />
      {isAdmin && (
        <>
          <Divider />
          <div>
            <h2 className="text-2xl font-bold">Workspace setting</h2>
            <p className="text-gray-500 text-sm">Manage your workspace.</p>
          </div>
          <MemberSection />
          <WorkspaceSection />
        </>
      )}
    </div>
  );
};

export default Setting;
