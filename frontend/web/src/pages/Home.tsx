import { useEffect } from "react";
import useLocalStorage from "react-use/lib/useLocalStorage";
import useNavigateTo from "@/hooks/useNavigateTo";

const Home: React.FC = () => {
  const [lastVisited] = useLocalStorage<string>("lastVisited", "/shortcuts");
  const navigateTo = useNavigateTo();

  useEffect(() => {
    if (lastVisited === "/shortcuts" || lastVisited === "/collections") {
      navigateTo(lastVisited);
    } else {
      navigateTo("/shortcuts");
    }
  }, []);

  return <></>;
};

export default Home;
