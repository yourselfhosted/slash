/* eslint-disable */

export const protobufPackage = "slash.api.v2";

export enum RowStatus {
  ROW_STATUS_UNSPECIFIED = 0,
  NORMAL = 1,
  ARCHIVED = 2,
  UNRECOGNIZED = -1,
}

export function rowStatusFromJSON(object: any): RowStatus {
  switch (object) {
    case 0:
    case "ROW_STATUS_UNSPECIFIED":
      return RowStatus.ROW_STATUS_UNSPECIFIED;
    case 1:
    case "NORMAL":
      return RowStatus.NORMAL;
    case 2:
    case "ARCHIVED":
      return RowStatus.ARCHIVED;
    case -1:
    case "UNRECOGNIZED":
    default:
      return RowStatus.UNRECOGNIZED;
  }
}

export function rowStatusToJSON(object: RowStatus): string {
  switch (object) {
    case RowStatus.ROW_STATUS_UNSPECIFIED:
      return "ROW_STATUS_UNSPECIFIED";
    case RowStatus.NORMAL:
      return "NORMAL";
    case RowStatus.ARCHIVED:
      return "ARCHIVED";
    case RowStatus.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}
