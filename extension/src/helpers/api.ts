import type { Shortcut } from "@/types/proto/api/v2/shortcut_service_pb";
import { Storage } from "@plasmohq/storage";
import axios from "axios";

const storage = new Storage();

export const getShortcutList = () => {
  const queryList = [];
  return axios.get<Shortcut[]>(`/api/v1/shortcut?${queryList.join("&")}`);
};

export const getUrlFavicon = async (url: string) => {
  const domain = await storage.getItem("domain");
  return axios.get<string>(`${domain}/api/v1/url/favicon?url=${url}`);
};
