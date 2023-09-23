import { Alert } from "@mui/joy";
import { useEffect } from "react";
import MemberSection from "../components/setting/MemberSection";
import WorkspaceSection from "../components/setting/WorkspaceSection";
import useUserStore from "../stores/v1/user";

const Setting: React.FC = () => {
  const currentUser = useUserStore().getCurrentUser();
  const isAdmin = currentUser.role === "ADMIN";

  useEffect(() => {
    if (!isAdmin) {
      window.location.href = "/";
    }
  }, []);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl w-full px-3 md:px-12 py-6 flex flex-col justify-start items-start gap-y-12">
      <Alert variant="soft" color="warning">
        You can see the settings items below because you are an Admin.
      </Alert>
      <MemberSection />
      <WorkspaceSection />
    </div>
  );
};

export default Setting;
