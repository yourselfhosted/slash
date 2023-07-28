import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { globalService } from "./services";
import useUserStore from "./stores/v1/user";
import DemoBanner from "./components/DemoBanner";

function App() {
  const userStore = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialState = async () => {
      try {
        await globalService.initialState();
      } catch (error) {
        // do nothing
      }

      try {
        await userStore.fetchCurrentUser();
      } catch (error) {
        // do nothing.
      }

      setLoading(false);
    };

    initialState();
  }, []);

  return (
    !loading && (
      <>
        <DemoBanner />
        <Outlet />
      </>
    )
  );
}

export default App;
