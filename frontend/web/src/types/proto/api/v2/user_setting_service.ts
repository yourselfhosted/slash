/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { FieldMask } from "../../google/protobuf/field_mask";

export const protobufPackage = "slash.api.v2";

export interface UserSetting {
  /** id is the user id. */
  id: number;
  /** locale is the user locale. */
  locale: UserSetting_Locale;
}

export enum UserSetting_Locale {
  LOCALE_UNSPECIFIED = 0,
  LOCALE_EN = 1,
  LOCALE_ZH = 2,
  UNRECOGNIZED = -1,
}

export function userSetting_LocaleFromJSON(object: any): UserSetting_Locale {
  switch (object) {
    case 0:
    case "LOCALE_UNSPECIFIED":
      return UserSetting_Locale.LOCALE_UNSPECIFIED;
    case 1:
    case "LOCALE_EN":
      return UserSetting_Locale.LOCALE_EN;
    case 2:
    case "LOCALE_ZH":
      return UserSetting_Locale.LOCALE_ZH;
    case -1:
    case "UNRECOGNIZED":
    default:
      return UserSetting_Locale.UNRECOGNIZED;
  }
}

export function userSetting_LocaleToJSON(object: UserSetting_Locale): string {
  switch (object) {
    case UserSetting_Locale.LOCALE_UNSPECIFIED:
      return "LOCALE_UNSPECIFIED";
    case UserSetting_Locale.LOCALE_EN:
      return "LOCALE_EN";
    case UserSetting_Locale.LOCALE_ZH:
      return "LOCALE_ZH";
    case UserSetting_Locale.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface GetUserSettingRequest {
  /** id is the user id. */
  id: number;
}

export interface GetUserSettingResponse {
  userSetting?: UserSetting | undefined;
}

export interface UpdateUserSettingRequest {
  /** id is the user id. */
  id: number;
  /** user_setting is the user setting to update. */
  userSetting?:
    | UserSetting
    | undefined;
  /** update_mask is the field mask to update the user setting. */
  updateMask?: string[] | undefined;
}

export interface UpdateUserSettingResponse {
  userSetting?: UserSetting | undefined;
}

function createBaseUserSetting(): UserSetting {
  return { id: 0, locale: 0 };
}

export const UserSetting = {
  encode(message: UserSetting, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.locale !== 0) {
      writer.uint32(16).int32(message.locale);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserSetting {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserSetting();
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

          message.locale = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UserSetting {
    return {
      id: isSet(object.id) ? Number(object.id) : 0,
      locale: isSet(object.locale) ? userSetting_LocaleFromJSON(object.locale) : 0,
    };
  },

  toJSON(message: UserSetting): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    message.locale !== undefined && (obj.locale = userSetting_LocaleToJSON(message.locale));
    return obj;
  },

  create(base?: DeepPartial<UserSetting>): UserSetting {
    return UserSetting.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<UserSetting>): UserSetting {
    const message = createBaseUserSetting();
    message.id = object.id ?? 0;
    message.locale = object.locale ?? 0;
    return message;
  },
};

function createBaseGetUserSettingRequest(): GetUserSettingRequest {
  return { id: 0 };
}

export const GetUserSettingRequest = {
  encode(message: GetUserSettingRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetUserSettingRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetUserSettingRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetUserSettingRequest {
    return { id: isSet(object.id) ? Number(object.id) : 0 };
  },

  toJSON(message: GetUserSettingRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    return obj;
  },

  create(base?: DeepPartial<GetUserSettingRequest>): GetUserSettingRequest {
    return GetUserSettingRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<GetUserSettingRequest>): GetUserSettingRequest {
    const message = createBaseGetUserSettingRequest();
    message.id = object.id ?? 0;
    return message;
  },
};

function createBaseGetUserSettingResponse(): GetUserSettingResponse {
  return { userSetting: undefined };
}

export const GetUserSettingResponse = {
  encode(message: GetUserSettingResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.userSetting !== undefined) {
      UserSetting.encode(message.userSetting, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetUserSettingResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetUserSettingResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.userSetting = UserSetting.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetUserSettingResponse {
    return { userSetting: isSet(object.userSetting) ? UserSetting.fromJSON(object.userSetting) : undefined };
  },

  toJSON(message: GetUserSettingResponse): unknown {
    const obj: any = {};
    message.userSetting !== undefined &&
      (obj.userSetting = message.userSetting ? UserSetting.toJSON(message.userSetting) : undefined);
    return obj;
  },

  create(base?: DeepPartial<GetUserSettingResponse>): GetUserSettingResponse {
    return GetUserSettingResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<GetUserSettingResponse>): GetUserSettingResponse {
    const message = createBaseGetUserSettingResponse();
    message.userSetting = (object.userSetting !== undefined && object.userSetting !== null)
      ? UserSetting.fromPartial(object.userSetting)
      : undefined;
    return message;
  },
};

function createBaseUpdateUserSettingRequest(): UpdateUserSettingRequest {
  return { id: 0, userSetting: undefined, updateMask: undefined };
}

export const UpdateUserSettingRequest = {
  encode(message: UpdateUserSettingRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.userSetting !== undefined) {
      UserSetting.encode(message.userSetting, writer.uint32(18).fork()).ldelim();
    }
    if (message.updateMask !== undefined) {
      FieldMask.encode(FieldMask.wrap(message.updateMask), writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateUserSettingRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateUserSettingRequest();
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
          if (tag !== 18) {
            break;
          }

          message.userSetting = UserSetting.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.updateMask = FieldMask.unwrap(FieldMask.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UpdateUserSettingRequest {
    return {
      id: isSet(object.id) ? Number(object.id) : 0,
      userSetting: isSet(object.userSetting) ? UserSetting.fromJSON(object.userSetting) : undefined,
      updateMask: isSet(object.updateMask) ? FieldMask.unwrap(FieldMask.fromJSON(object.updateMask)) : undefined,
    };
  },

  toJSON(message: UpdateUserSettingRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    message.userSetting !== undefined &&
      (obj.userSetting = message.userSetting ? UserSetting.toJSON(message.userSetting) : undefined);
    message.updateMask !== undefined && (obj.updateMask = FieldMask.toJSON(FieldMask.wrap(message.updateMask)));
    return obj;
  },

  create(base?: DeepPartial<UpdateUserSettingRequest>): UpdateUserSettingRequest {
    return UpdateUserSettingRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<UpdateUserSettingRequest>): UpdateUserSettingRequest {
    const message = createBaseUpdateUserSettingRequest();
    message.id = object.id ?? 0;
    message.userSetting = (object.userSetting !== undefined && object.userSetting !== null)
      ? UserSetting.fromPartial(object.userSetting)
      : undefined;
    message.updateMask = object.updateMask ?? undefined;
    return message;
  },
};

function createBaseUpdateUserSettingResponse(): UpdateUserSettingResponse {
  return { userSetting: undefined };
}

export const UpdateUserSettingResponse = {
  encode(message: UpdateUserSettingResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.userSetting !== undefined) {
      UserSetting.encode(message.userSetting, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateUserSettingResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateUserSettingResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.userSetting = UserSetting.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UpdateUserSettingResponse {
    return { userSetting: isSet(object.userSetting) ? UserSetting.fromJSON(object.userSetting) : undefined };
  },

  toJSON(message: UpdateUserSettingResponse): unknown {
    const obj: any = {};
    message.userSetting !== undefined &&
      (obj.userSetting = message.userSetting ? UserSetting.toJSON(message.userSetting) : undefined);
    return obj;
  },

  create(base?: DeepPartial<UpdateUserSettingResponse>): UpdateUserSettingResponse {
    return UpdateUserSettingResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<UpdateUserSettingResponse>): UpdateUserSettingResponse {
    const message = createBaseUpdateUserSettingResponse();
    message.userSetting = (object.userSetting !== undefined && object.userSetting !== null)
      ? UserSetting.fromPartial(object.userSetting)
      : undefined;
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
