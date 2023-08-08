import { Input } from "@mui/joy";
import { useStorage } from "@plasmohq/storage/hook";
import "../style.css";
import Icon from "./Icon";

const Setting = () => {
  const [domain, setDomain] = useStorage("domain");
  const [accessToken, setAccessToken] = useStorage("access_token");

  return (
    <div>
      <h2 className="flex flex-row justify-start items-center mb-2">
        <Icon.Settings className="w-5 h-auto mr-1" />
        <span className="text-lg">Setting</span>
      </h2>

      <div className="w-full flex flex-col justify-start items-start mb-2">
        <span className="mb-2 text-base">Domain</span>
        <div className="relative w-full">
          <Input
            className="w-full"
            type="text"
            placeholder="The domain of your Slash instance"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full flex flex-col justify-start items-start">
        <span className="mb-2 text-base">Access Token</span>
        <div className="relative w-full">
          <Input
            className="w-full"
            type="text"
            placeholder="The access token of your Slash instance"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Setting;
