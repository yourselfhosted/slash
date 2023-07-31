import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import useUserStore from "../stores/v1/user";

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
        <div className="w-full h-auto flex flex-col justify-start items-start">
          <Header />
          <Outlet />
        </div>
      )}
    </>
  );
};

export default Root;
