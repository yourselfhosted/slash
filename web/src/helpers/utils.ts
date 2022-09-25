import { isNull, isUndefined } from "lodash-es";

export const isNullorUndefined = (value: any) => {
  return isNull(value) || isUndefined(value);
};

export function getNowTimeStamp(): number {
  return Date.now();
}

export function getOSVersion(): "Windows" | "MacOS" | "Linux" | "Unknown" {
  const appVersion = navigator.userAgent;
  let detectedOS: "Windows" | "MacOS" | "Linux" | "Unknown" = "Unknown";

  if (appVersion.indexOf("Win") != -1) {
    detectedOS = "Windows";
  } else if (appVersion.indexOf("Mac") != -1) {
    detectedOS = "MacOS";
  } else if (appVersion.indexOf("Linux") != -1) {
    detectedOS = "Linux";
  }

  return detectedOS;
}

export function debounce(fn: FunctionType, delay: number) {
  let timer: number | null = null;

  return () => {
    if (timer) {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    } else {
      timer = setTimeout(fn, delay);
    }
  };
}

export function throttle(fn: FunctionType, delay: number) {
  let valid = true;

  return () => {
    if (!valid) {
      return false;
    }
    valid = false;
    setTimeout(() => {
      fn();
      valid = true;
    }, delay);
  };
}
