import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useUserStore from "../stores/v1/user";
import Header from "../components/Header";

const Root: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useUserStore().getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth", {
        replace: true,
      });
    }
  }, []);

  return (
    <>
      {currentUser && (
        <div className="w-full h-full flex flex-col justify-start items-start">
          <Header />
          <Outlet />
        </div>
      )}
    </>
  );
};

export default Root;
