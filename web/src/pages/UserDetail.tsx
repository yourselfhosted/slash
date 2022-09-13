import { useAppSelector } from "../store";
import Header from "../components/Header";

const UserDetail: React.FC = () => {
  const { user } = useAppSelector((state) => state.user);

  return (
    <div className="w-full h-full flex flex-col justify-start items-start">
      <Header />
      <div className="mx-auto max-w-4xl w-full px-3 py-6 flex flex-col justify-start items-start">
        <p className="text-3xl mt-2 mb-4">{user?.name}</p>
        <p className="leading-10">Email: {user?.email}</p>
        <p className="leading-10">OpenID: {user?.openId}</p>
      </div>
    </div>
  );
};

export default UserDetail;
