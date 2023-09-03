/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { RowStatus, rowStatusFromJSON, rowStatusToJSON } from "./common";

export const protobufPackage = "slash.store";

export enum Visibility {
  VISIBILITY_UNSPECIFIED = 0,
  PRIVATE = 1,
  WORKSPACE = 2,
  PUBLIC = 3,
  UNRECOGNIZED = -1,
}

export function visibilityFromJSON(object: any): Visibility {
  switch (object) {
    case 0:
    case "VISIBILITY_UNSPECIFIED":
      return Visibility.VISIBILITY_UNSPECIFIED;
    case 1:
    case "PRIVATE":
      return Visibility.PRIVATE;
    case 2:
    case "WORKSPACE":
      return Visibility.WORKSPACE;
    case 3:
    case "PUBLIC":
      return Visibility.PUBLIC;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Visibility.UNRECOGNIZED;
  }
}

export function visibilityToJSON(object: Visibility): string {
  switch (object) {
    case Visibility.VISIBILITY_UNSPECIFIED:
      return "VISIBILITY_UNSPECIFIED";
    case Visibility.PRIVATE:
      return "PRIVATE";
    case Visibility.WORKSPACE:
      return "WORKSPACE";
    case Visibility.PUBLIC:
      return "PUBLIC";
    case Visibility.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface Shortcut {
  id: number;
  creatorId: number;
  createdTs: number;
  updatedTs: number;
  rowStatus: RowStatus;
  name: string;
  link: string;
  title: string;
  tags: string[];
  description: string;
  visibility: Visibility;
  ogMetadata?: OpenGraphMetadata | undefined;
}

export interface OpenGraphMetadata {
  title: string;
  description: string;
  image: string;
}

function createBaseShortcut(): Shortcut {
  return {
    id: 0,
    creatorId: 0,
    createdTs: 0,
    updatedTs: 0,
    rowStatus: 0,
    name: "",
    link: "",
    title: "",
    tags: [],
    description: "",
    visibility: 0,
    ogMetadata: undefined,
  };
}

export const Shortcut = {
  encode(message: Shortcut, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.creatorId !== 0) {
      writer.uint32(16).int32(message.creatorId);
    }
    if (message.createdTs !== 0) {
      writer.uint32(24).int64(message.createdTs);
    }
    if (message.updatedTs !== 0) {
      writer.uint32(32).int64(message.updatedTs);
    }
    if (message.rowStatus !== 0) {
      writer.uint32(40).int32(message.rowStatus);
    }
    if (message.name !== "") {
      writer.uint32(50).string(message.name);
    }
    if (message.link !== "") {
      writer.uint32(58).string(message.link);
    }
    if (message.title !== "") {
      writer.uint32(66).string(message.title);
    }
    for (const v of message.tags) {
      writer.uint32(74).string(v!);
    }
    if (message.description !== "") {
      writer.uint32(82).string(message.description);
    }
    if (message.visibility !== 0) {
      writer.uint32(88).int32(message.visibility);
    }
    if (message.ogMetadata !== undefined) {
      OpenGraphMetadata.encode(message.ogMetadata, writer.uint32(98).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Shortcut {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseShortcut();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.creatorId = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.createdTs = longToNumber(reader.int64() as Long);
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.updatedTs = longToNumber(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.rowStatus = reader.int32() as any;
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.name = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.link = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.title = reader.string();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.tags.push(reader.string());
          continue;
        case 10:
          if (tag !== 82) {
            break;
          }

          message.description = reader.string();
          continue;
        case 11:
          if (tag !== 88) {
            break;
          }

          message.visibility = reader.int32() as any;
          continue;
        case 12:
          if (tag !== 98) {
            break;
          }

          message.ogMetadata = OpenGraphMetadata.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Shortcut {
    return {
      id: isSet(object.id) ? Number(object.id) : 0,
      creatorId: isSet(object.creatorId) ? Number(object.creatorId) : 0,
      createdTs: isSet(object.createdTs) ? Number(object.createdTs) : 0,
      updatedTs: isSet(object.updatedTs) ? Number(object.updatedTs) : 0,
      rowStatus: isSet(object.rowStatus) ? rowStatusFromJSON(object.rowStatus) : 0,
      name: isSet(object.name) ? String(object.name) : "",
      link: isSet(object.link) ? String(object.link) : "",
      title: isSet(object.title) ? String(object.title) : "",
      tags: Array.isArray(object?.tags) ? object.tags.map((e: any) => String(e)) : [],
      description: isSet(object.description) ? String(object.description) : "",
      visibility: isSet(object.visibility) ? visibilityFromJSON(object.visibility) : 0,
      ogMetadata: isSet(object.ogMetadata) ? OpenGraphMetadata.fromJSON(object.ogMetadata) : undefined,
    };
  },

  toJSON(message: Shortcut): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    message.creatorId !== undefined && (obj.creatorId = Math.round(message.creatorId));
    message.createdTs !== undefined && (obj.createdTs = Math.round(message.createdTs));
    message.updatedTs !== undefined && (obj.updatedTs = Math.round(message.updatedTs));
    message.rowStatus !== undefined && (obj.rowStatus = rowStatusToJSON(message.rowStatus));
    message.name !== undefined && (obj.name = message.name);
    message.link !== undefined && (obj.link = message.link);
    message.title !== undefined && (obj.title = message.title);
    if (message.tags) {
      obj.tags = message.tags.map((e) => e);
    } else {
      obj.tags = [];
    }
    message.description !== undefined && (obj.description = message.description);
    message.visibility !== undefined && (obj.visibility = visibilityToJSON(message.visibility));
    message.ogMetadata !== undefined &&
      (obj.ogMetadata = message.ogMetadata ? OpenGraphMetadata.toJSON(message.ogMetadata) : undefined);
    return obj;
  },

  create(base?: DeepPartial<Shortcut>): Shortcut {
    return Shortcut.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<Shortcut>): Shortcut {
    const message = createBaseShortcut();
    message.id = object.id ?? 0;
    message.creatorId = object.creatorId ?? 0;
    message.createdTs = object.createdTs ?? 0;
    message.updatedTs = object.updatedTs ?? 0;
    message.rowStatus = object.rowStatus ?? 0;
    message.name = object.name ?? "";
    message.link = object.link ?? "";
    message.title = object.title ?? "";
    message.tags = object.tags?.map((e) => e) || [];
    message.description = object.description ?? "";
    message.visibility = object.visibility ?? 0;
    message.ogMetadata = (object.ogMetadata !== undefined && object.ogMetadata !== null)
      ? OpenGraphMetadata.fromPartial(object.ogMetadata)
      : undefined;
    return message;
  },
};

function createBaseOpenGraphMetadata(): OpenGraphMetadata {
  return { title: "", description: "", image: "" };
}

export const OpenGraphMetadata = {
  encode(message: OpenGraphMetadata, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    if (message.image !== "") {
      writer.uint32(26).string(message.image);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): OpenGraphMetadata {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOpenGraphMetadata();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.title = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.description = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.image = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): OpenGraphMetadata {
    return {
      title: isSet(object.title) ? String(object.title) : "",
      description: isSet(object.description) ? String(object.description) : "",
      image: isSet(object.image) ? String(object.image) : "",
    };
  },

  toJSON(message: OpenGraphMetadata): unknown {
    const obj: any = {};
    message.title !== undefined && (obj.title = message.title);
    message.description !== undefined && (obj.description = message.description);
    message.image !== undefined && (obj.image = message.image);
    return obj;
  },

  create(base?: DeepPartial<OpenGraphMetadata>): OpenGraphMetadata {
    return OpenGraphMetadata.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<OpenGraphMetadata>): OpenGraphMetadata {
    const message = createBaseOpenGraphMetadata();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.image = object.image ?? "";
    return message;
  },
};

declare const self: any | undefined;
declare const window: any | undefined;
declare const global: any | undefined;
const tsProtoGlobalThis: any = (() => {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw "Unable to locate global object";
})();

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new tsProtoGlobalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
