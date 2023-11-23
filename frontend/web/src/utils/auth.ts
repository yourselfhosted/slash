import Cookies from "js-cookie";

export const setAccessToken = (token: string) => {
  Cookies.set("slash.access-token", token, { path: "/", expires: 365 });
};

export const removeAccessToken = () => {
  Cookies.remove("slash.access-token", { path: "/", expires: 365 });
};
