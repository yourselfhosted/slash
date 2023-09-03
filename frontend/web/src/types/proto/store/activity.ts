/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "slash.store";

export interface ActivityShorcutCreatePayload {
  shortcutId: number;
}

function createBaseActivityShorcutCreatePayload(): ActivityShorcutCreatePayload {
  return { shortcutId: 0 };
}

export const ActivityShorcutCreatePayload = {
  encode(message: ActivityShorcutCreatePayload, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.shortcutId !== 0) {
      writer.uint32(8).int32(message.shortcutId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ActivityShorcutCreatePayload {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseActivityShorcutCreatePayload();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.shortcutId = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ActivityShorcutCreatePayload {
    return { shortcutId: isSet(object.shortcutId) ? Number(object.shortcutId) : 0 };
  },

  toJSON(message: ActivityShorcutCreatePayload): unknown {
    const obj: any = {};
    message.shortcutId !== undefined && (obj.shortcutId = Math.round(message.shortcutId));
    return obj;
  },

  create(base?: DeepPartial<ActivityShorcutCreatePayload>): ActivityShorcutCreatePayload {
    return ActivityShorcutCreatePayload.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ActivityShorcutCreatePayload>): ActivityShorcutCreatePayload {
    const message = createBaseActivityShorcutCreatePayload();
    message.shortcutId = object.shortcutId ?? 0;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
