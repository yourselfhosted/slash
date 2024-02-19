import { Visibility } from "@/types/proto/api/v1/common";

export const convertVisibilityFromPb = (visibility: Visibility): string => {
  if (visibility === Visibility.PRIVATE) {
    return "PRIVATE";
  } else if (visibility === Visibility.WORKSPACE) {
    return "WORKSPACE";
  } else if (visibility === Visibility.PUBLIC) {
    return "PUBLIC";
  } else {
    return "PRIVATE";
  }
};
