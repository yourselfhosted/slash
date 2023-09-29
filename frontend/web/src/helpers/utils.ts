import { isNull, isUndefined } from "lodash-es";

export const isNullorUndefined = (value: any) => {
  return isNull(value) || isUndefined(value);
};

export const absolutifyLink = (rel: string): string => {
  const anchor = document.createElement("a");
  anchor.setAttribute("href", rel);
  return anchor.href;
};

export const releaseGuard = () => {
  return import.meta.env.MODE === "development";
};

export const getFaviconWithGoogleS2 = (url: string) => {
  try {
    const urlObject = new URL(url);
    return `https://www.google.com/s2/favicons?sz=128&domain=${urlObject.hostname}`;
  } catch (error) {
    return undefined;
  }
};
