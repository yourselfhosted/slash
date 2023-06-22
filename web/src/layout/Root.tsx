import { Outlet } from "react-router-dom";
import Header from "../components/Header";

const Root: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col justify-start items-start">
      <Header />
      <Outlet />
    </div>
  );
};

export default Root;
