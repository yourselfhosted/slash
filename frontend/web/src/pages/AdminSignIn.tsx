import React from "react";
import Logo from "@/components/Logo";
import PasswordAuthForm from "@/components/PasswordAuthForm";

const AdminSignIn: React.FC = () => {
  return (
    <div className="flex flex-row justify-center items-center w-full h-auto pt-12 sm:pt-24 bg-background">
      <div className="w-80 max-w-full h-full py-4 flex flex-col justify-start items-center">
        <div className="w-full py-4 grow flex flex-col justify-center items-center">
          <div className="flex flex-row justify-start items-center w-auto mx-auto gap-y-2 mb-4">
            <Logo className="mr-2" />
            <span className="text-3xl opacity-80 text-muted-foreground">Slash</span>
          </div>
          <p className="w-full text-xl font-medium text-foreground">Sign in with admin accounts</p>
          <PasswordAuthForm />
        </div>
      </div>
    </div>
  );
};

export default AdminSignIn;
