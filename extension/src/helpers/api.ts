import { Storage } from "@plasmohq/storage";
import axios from "axios";

const storage = new Storage();

export const getUrlFavicon = async (url: string) => {
  const domain = await storage.getItem<string>("domain");
  const accessToken = await storage.getItem<string>("access_token");
  return axios.get<string>(`${domain}/api/v1/url/favicon?url=${url}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
