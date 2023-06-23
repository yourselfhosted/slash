import { Switch } from "@mui/joy";
import { useEffect, useState } from "react";
import { getSystemStatus, upsertWorkspaceSetting } from "../../helpers/api";

const WorkspaceSection: React.FC = () => {
  const [disallowSignUp, setDisallowSignUp] = useState<boolean>(false);

  useEffect(() => {
    getSystemStatus().then(({ data }) => {
      setDisallowSignUp(data.disallowSignUp);
    });
  }, []);

  const handleDisallowSignUpChange = async (value: boolean) => {
    await upsertWorkspaceSetting("disallow-signup", JSON.stringify(value));
    setDisallowSignUp(value);
  };

  return (
    <>
      <div className="mx-auto max-w-4xl w-full px-3 py-6 flex flex-col justify-start items-start space-y-4">
        <p className="text-gray-400">Workspace settings</p>
        <div className="w-full flex flex-row justify-between items-center">
          <span>Allow sign up</span>
          <Switch checked={disallowSignUp} onChange={(event) => handleDisallowSignUpChange(event.target.checked)} />
        </div>
      </div>
    </>
  );
};

export default WorkspaceSection;
