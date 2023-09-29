import { isNull, isUndefined } from "lodash-es";

export const isNullorUndefined = (value: any) => {
  return isNull(value) || isUndefined(value);
};

export const getFaviconWithGoogleS2 = (url: string) => {
  try {
    const urlObject = new URL(url);
    return `https://www.google.com/s2/favicons?sz=128&domain=${urlObject.hostname}`;
  } catch (error) {
    return undefined;
  }
};
