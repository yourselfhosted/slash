/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Timestamp } from "../../google/protobuf/timestamp";
import { RowStatus, rowStatusFromJSON, rowStatusToJSON } from "./common";

export const protobufPackage = "slash.api.v2";

export enum Role {
  ROLE_UNSPECIFIED = 0,
  ADMIN = 1,
  USER = 2,
  UNRECOGNIZED = -1,
}

export function roleFromJSON(object: any): Role {
  switch (object) {
    case 0:
    case "ROLE_UNSPECIFIED":
      return Role.ROLE_UNSPECIFIED;
    case 1:
    case "ADMIN":
      return Role.ADMIN;
    case 2:
    case "USER":
      return Role.USER;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Role.UNRECOGNIZED;
  }
}

export function roleToJSON(object: Role): string {
  switch (object) {
    case Role.ROLE_UNSPECIFIED:
      return "ROLE_UNSPECIFIED";
    case Role.ADMIN:
      return "ADMIN";
    case Role.USER:
      return "USER";
    case Role.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface User {
  id: number;
  rowStatus: RowStatus;
  createdTs: number;
  updatedTs: number;
  role: Role;
  email: string;
  nickname: string;
  password: string;
}

export interface ListUsersRequest {
}

export interface ListUsersResponse {
  users: User[];
}

export interface GetUserRequest {
  id: number;
}

export interface GetUserResponse {
  user?: User | undefined;
}

export interface CreateUserRequest {
  user?: User | undefined;
}

export interface CreateUserResponse {
  user?: User | undefined;
}

export interface DeleteUserRequest {
  id: number;
}

export interface DeleteUserResponse {
}

export interface ListUserAccessTokensRequest {
  /** id is the user id. */
  id: number;
}

export interface ListUserAccessTokensResponse {
  accessTokens: UserAccessToken[];
}

export interface CreateUserAccessTokenRequest {
  /** id is the user id. */
  id: number;
  userAccessToken?: UserAccessToken | undefined;
}

export interface CreateUserAccessTokenResponse {
  accessToken?: UserAccessToken | undefined;
}

export interface DeleteUserAccessTokenRequest {
  /** id is the user id. */
  id: number;
  /** access_token is the access token to delete. */
  accessToken: string;
}

export interface DeleteUserAccessTokenResponse {
}

export interface UserAccessToken {
  accessToken: string;
  description: string;
  issuedAt?: Date | undefined;
  expiresAt?: Date | undefined;
}

function createBaseUser(): User {
  return { id: 0, rowStatus: 0, createdTs: 0, updatedTs: 0, role: 0, email: "", nickname: "", password: "" };
}

export const User = {
  encode(message: User, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.rowStatus !== 0) {
      writer.uint32(16).int32(message.rowStatus);
    }
    if (message.createdTs !== 0) {
      writer.uint32(24).int64(message.createdTs);
    }
    if (message.updatedTs !== 0) {
      writer.uint32(32).int64(message.updatedTs);
    }
    if (message.role !== 0) {
      writer.uint32(48).int32(message.role);
    }
    if (message.email !== "") {
      writer.uint32(58).string(message.email);
    }
    if (message.nickname !== "") {
      writer.uint32(66).string(message.nickname);
    }
    if (message.password !== "") {
      writer.uint32(74).string(message.password);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): User {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUser();
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

          message.rowStatus = reader.int32() as any;
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
        case 6:
          if (tag !== 48) {
            break;
          }

          message.role = reader.int32() as any;
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.email = reader.string();
          continue;
        case 8:
          if (tag !== 66) {
            break;
          }

          message.nickname = reader.string();
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.password = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): User {
    return {
      id: isSet(object.id) ? Number(object.id) : 0,
      rowStatus: isSet(object.rowStatus) ? rowStatusFromJSON(object.rowStatus) : 0,
      createdTs: isSet(object.createdTs) ? Number(object.createdTs) : 0,
      updatedTs: isSet(object.updatedTs) ? Number(object.updatedTs) : 0,
      role: isSet(object.role) ? roleFromJSON(object.role) : 0,
      email: isSet(object.email) ? String(object.email) : "",
      nickname: isSet(object.nickname) ? String(object.nickname) : "",
      password: isSet(object.password) ? String(object.password) : "",
    };
  },

  toJSON(message: User): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    message.rowStatus !== undefined && (obj.rowStatus = rowStatusToJSON(message.rowStatus));
    message.createdTs !== undefined && (obj.createdTs = Math.round(message.createdTs));
    message.updatedTs !== undefined && (obj.updatedTs = Math.round(message.updatedTs));
    message.role !== undefined && (obj.role = roleToJSON(message.role));
    message.email !== undefined && (obj.email = message.email);
    message.nickname !== undefined && (obj.nickname = message.nickname);
    message.password !== undefined && (obj.password = message.password);
    return obj;
  },

  create(base?: DeepPartial<User>): User {
    return User.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<User>): User {
    const message = createBaseUser();
    message.id = object.id ?? 0;
    message.rowStatus = object.rowStatus ?? 0;
    message.createdTs = object.createdTs ?? 0;
    message.updatedTs = object.updatedTs ?? 0;
    message.role = object.role ?? 0;
    message.email = object.email ?? "";
    message.nickname = object.nickname ?? "";
    message.password = object.password ?? "";
    return message;
  },
};

function createBaseListUsersRequest(): ListUsersRequest {
  return {};
}

export const ListUsersRequest = {
  encode(_: ListUsersRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListUsersRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListUsersRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): ListUsersRequest {
    return {};
  },

  toJSON(_: ListUsersRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<ListUsersRequest>): ListUsersRequest {
    return ListUsersRequest.fromPartial(base ?? {});
  },

  fromPartial(_: DeepPartial<ListUsersRequest>): ListUsersRequest {
    const message = createBaseListUsersRequest();
    return message;
  },
};

function createBaseListUsersResponse(): ListUsersResponse {
  return { users: [] };
}

export const ListUsersResponse = {
  encode(message: ListUsersResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.users) {
      User.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListUsersResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListUsersResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.users.push(User.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListUsersResponse {
    return { users: Array.isArray(object?.users) ? object.users.map((e: any) => User.fromJSON(e)) : [] };
  },

  toJSON(message: ListUsersResponse): unknown {
    const obj: any = {};
    if (message.users) {
      obj.users = message.users.map((e) => e ? User.toJSON(e) : undefined);
    } else {
      obj.users = [];
    }
    return obj;
  },

  create(base?: DeepPartial<ListUsersResponse>): ListUsersResponse {
    return ListUsersResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ListUsersResponse>): ListUsersResponse {
    const message = createBaseListUsersResponse();
    message.users = object.users?.map((e) => User.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGetUserRequest(): GetUserRequest {
  return { id: 0 };
}

export const GetUserRequest = {
  encode(message: GetUserRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetUserRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetUserRequest();
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

  fromJSON(object: any): GetUserRequest {
    return { id: isSet(object.id) ? Number(object.id) : 0 };
  },

  toJSON(message: GetUserRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    return obj;
  },

  create(base?: DeepPartial<GetUserRequest>): GetUserRequest {
    return GetUserRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<GetUserRequest>): GetUserRequest {
    const message = createBaseGetUserRequest();
    message.id = object.id ?? 0;
    return message;
  },
};

function createBaseGetUserResponse(): GetUserResponse {
  return { user: undefined };
}

export const GetUserResponse = {
  encode(message: GetUserResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetUserResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetUserResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.user = User.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetUserResponse {
    return { user: isSet(object.user) ? User.fromJSON(object.user) : undefined };
  },

  toJSON(message: GetUserResponse): unknown {
    const obj: any = {};
    message.user !== undefined && (obj.user = message.user ? User.toJSON(message.user) : undefined);
    return obj;
  },

  create(base?: DeepPartial<GetUserResponse>): GetUserResponse {
    return GetUserResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<GetUserResponse>): GetUserResponse {
    const message = createBaseGetUserResponse();
    message.user = (object.user !== undefined && object.user !== null) ? User.fromPartial(object.user) : undefined;
    return message;
  },
};

function createBaseCreateUserRequest(): CreateUserRequest {
  return { user: undefined };
}

export const CreateUserRequest = {
  encode(message: CreateUserRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateUserRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateUserRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.user = User.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CreateUserRequest {
    return { user: isSet(object.user) ? User.fromJSON(object.user) : undefined };
  },

  toJSON(message: CreateUserRequest): unknown {
    const obj: any = {};
    message.user !== undefined && (obj.user = message.user ? User.toJSON(message.user) : undefined);
    return obj;
  },

  create(base?: DeepPartial<CreateUserRequest>): CreateUserRequest {
    return CreateUserRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<CreateUserRequest>): CreateUserRequest {
    const message = createBaseCreateUserRequest();
    message.user = (object.user !== undefined && object.user !== null) ? User.fromPartial(object.user) : undefined;
    return message;
  },
};

function createBaseCreateUserResponse(): CreateUserResponse {
  return { user: undefined };
}

export const CreateUserResponse = {
  encode(message: CreateUserResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateUserResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateUserResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.user = User.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CreateUserResponse {
    return { user: isSet(object.user) ? User.fromJSON(object.user) : undefined };
  },

  toJSON(message: CreateUserResponse): unknown {
    const obj: any = {};
    message.user !== undefined && (obj.user = message.user ? User.toJSON(message.user) : undefined);
    return obj;
  },

  create(base?: DeepPartial<CreateUserResponse>): CreateUserResponse {
    return CreateUserResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<CreateUserResponse>): CreateUserResponse {
    const message = createBaseCreateUserResponse();
    message.user = (object.user !== undefined && object.user !== null) ? User.fromPartial(object.user) : undefined;
    return message;
  },
};

function createBaseDeleteUserRequest(): DeleteUserRequest {
  return { id: 0 };
}

export const DeleteUserRequest = {
  encode(message: DeleteUserRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeleteUserRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeleteUserRequest();
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

  fromJSON(object: any): DeleteUserRequest {
    return { id: isSet(object.id) ? Number(object.id) : 0 };
  },

  toJSON(message: DeleteUserRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    return obj;
  },

  create(base?: DeepPartial<DeleteUserRequest>): DeleteUserRequest {
    return DeleteUserRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<DeleteUserRequest>): DeleteUserRequest {
    const message = createBaseDeleteUserRequest();
    message.id = object.id ?? 0;
    return message;
  },
};

function createBaseDeleteUserResponse(): DeleteUserResponse {
  return {};
}

export const DeleteUserResponse = {
  encode(_: DeleteUserResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeleteUserResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeleteUserResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): DeleteUserResponse {
    return {};
  },

  toJSON(_: DeleteUserResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<DeleteUserResponse>): DeleteUserResponse {
    return DeleteUserResponse.fromPartial(base ?? {});
  },

  fromPartial(_: DeepPartial<DeleteUserResponse>): DeleteUserResponse {
    const message = createBaseDeleteUserResponse();
    return message;
  },
};

function createBaseListUserAccessTokensRequest(): ListUserAccessTokensRequest {
  return { id: 0 };
}

export const ListUserAccessTokensRequest = {
  encode(message: ListUserAccessTokensRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListUserAccessTokensRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListUserAccessTokensRequest();
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

  fromJSON(object: any): ListUserAccessTokensRequest {
    return { id: isSet(object.id) ? Number(object.id) : 0 };
  },

  toJSON(message: ListUserAccessTokensRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    return obj;
  },

  create(base?: DeepPartial<ListUserAccessTokensRequest>): ListUserAccessTokensRequest {
    return ListUserAccessTokensRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ListUserAccessTokensRequest>): ListUserAccessTokensRequest {
    const message = createBaseListUserAccessTokensRequest();
    message.id = object.id ?? 0;
    return message;
  },
};

function createBaseListUserAccessTokensResponse(): ListUserAccessTokensResponse {
  return { accessTokens: [] };
}

export const ListUserAccessTokensResponse = {
  encode(message: ListUserAccessTokensResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.accessTokens) {
      UserAccessToken.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListUserAccessTokensResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListUserAccessTokensResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.accessTokens.push(UserAccessToken.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ListUserAccessTokensResponse {
    return {
      accessTokens: Array.isArray(object?.accessTokens)
        ? object.accessTokens.map((e: any) => UserAccessToken.fromJSON(e))
        : [],
    };
  },

  toJSON(message: ListUserAccessTokensResponse): unknown {
    const obj: any = {};
    if (message.accessTokens) {
      obj.accessTokens = message.accessTokens.map((e) => e ? UserAccessToken.toJSON(e) : undefined);
    } else {
      obj.accessTokens = [];
    }
    return obj;
  },

  create(base?: DeepPartial<ListUserAccessTokensResponse>): ListUserAccessTokensResponse {
    return ListUserAccessTokensResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ListUserAccessTokensResponse>): ListUserAccessTokensResponse {
    const message = createBaseListUserAccessTokensResponse();
    message.accessTokens = object.accessTokens?.map((e) => UserAccessToken.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCreateUserAccessTokenRequest(): CreateUserAccessTokenRequest {
  return { id: 0, userAccessToken: undefined };
}

export const CreateUserAccessTokenRequest = {
  encode(message: CreateUserAccessTokenRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.userAccessToken !== undefined) {
      UserAccessToken.encode(message.userAccessToken, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateUserAccessTokenRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateUserAccessTokenRequest();
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

          message.userAccessToken = UserAccessToken.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CreateUserAccessTokenRequest {
    return {
      id: isSet(object.id) ? Number(object.id) : 0,
      userAccessToken: isSet(object.userAccessToken) ? UserAccessToken.fromJSON(object.userAccessToken) : undefined,
    };
  },

  toJSON(message: CreateUserAccessTokenRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    message.userAccessToken !== undefined &&
      (obj.userAccessToken = message.userAccessToken ? UserAccessToken.toJSON(message.userAccessToken) : undefined);
    return obj;
  },

  create(base?: DeepPartial<CreateUserAccessTokenRequest>): CreateUserAccessTokenRequest {
    return CreateUserAccessTokenRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<CreateUserAccessTokenRequest>): CreateUserAccessTokenRequest {
    const message = createBaseCreateUserAccessTokenRequest();
    message.id = object.id ?? 0;
    message.userAccessToken = (object.userAccessToken !== undefined && object.userAccessToken !== null)
      ? UserAccessToken.fromPartial(object.userAccessToken)
      : undefined;
    return message;
  },
};

function createBaseCreateUserAccessTokenResponse(): CreateUserAccessTokenResponse {
  return { accessToken: undefined };
}

export const CreateUserAccessTokenResponse = {
  encode(message: CreateUserAccessTokenResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.accessToken !== undefined) {
      UserAccessToken.encode(message.accessToken, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateUserAccessTokenResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateUserAccessTokenResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.accessToken = UserAccessToken.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CreateUserAccessTokenResponse {
    return { accessToken: isSet(object.accessToken) ? UserAccessToken.fromJSON(object.accessToken) : undefined };
  },

  toJSON(message: CreateUserAccessTokenResponse): unknown {
    const obj: any = {};
    message.accessToken !== undefined &&
      (obj.accessToken = message.accessToken ? UserAccessToken.toJSON(message.accessToken) : undefined);
    return obj;
  },

  create(base?: DeepPartial<CreateUserAccessTokenResponse>): CreateUserAccessTokenResponse {
    return CreateUserAccessTokenResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<CreateUserAccessTokenResponse>): CreateUserAccessTokenResponse {
    const message = createBaseCreateUserAccessTokenResponse();
    message.accessToken = (object.accessToken !== undefined && object.accessToken !== null)
      ? UserAccessToken.fromPartial(object.accessToken)
      : undefined;
    return message;
  },
};

function createBaseDeleteUserAccessTokenRequest(): DeleteUserAccessTokenRequest {
  return { id: 0, accessToken: "" };
}

export const DeleteUserAccessTokenRequest = {
  encode(message: DeleteUserAccessTokenRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.accessToken !== "") {
      writer.uint32(18).string(message.accessToken);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeleteUserAccessTokenRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeleteUserAccessTokenRequest();
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

          message.accessToken = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DeleteUserAccessTokenRequest {
    return {
      id: isSet(object.id) ? Number(object.id) : 0,
      accessToken: isSet(object.accessToken) ? String(object.accessToken) : "",
    };
  },

  toJSON(message: DeleteUserAccessTokenRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    message.accessToken !== undefined && (obj.accessToken = message.accessToken);
    return obj;
  },

  create(base?: DeepPartial<DeleteUserAccessTokenRequest>): DeleteUserAccessTokenRequest {
    return DeleteUserAccessTokenRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<DeleteUserAccessTokenRequest>): DeleteUserAccessTokenRequest {
    const message = createBaseDeleteUserAccessTokenRequest();
    message.id = object.id ?? 0;
    message.accessToken = object.accessToken ?? "";
    return message;
  },
};

function createBaseDeleteUserAccessTokenResponse(): DeleteUserAccessTokenResponse {
  return {};
}

export const DeleteUserAccessTokenResponse = {
  encode(_: DeleteUserAccessTokenResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeleteUserAccessTokenResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeleteUserAccessTokenResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): DeleteUserAccessTokenResponse {
    return {};
  },

  toJSON(_: DeleteUserAccessTokenResponse): unknown {
    const obj: any = {};
    return obj;
  },

  create(base?: DeepPartial<DeleteUserAccessTokenResponse>): DeleteUserAccessTokenResponse {
    return DeleteUserAccessTokenResponse.fromPartial(base ?? {});
  },

  fromPartial(_: DeepPartial<DeleteUserAccessTokenResponse>): DeleteUserAccessTokenResponse {
    const message = createBaseDeleteUserAccessTokenResponse();
    return message;
  },
};

function createBaseUserAccessToken(): UserAccessToken {
  return { accessToken: "", description: "", issuedAt: undefined, expiresAt: undefined };
}

export const UserAccessToken = {
  encode(message: UserAccessToken, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.accessToken !== "") {
      writer.uint32(10).string(message.accessToken);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    if (message.issuedAt !== undefined) {
      Timestamp.encode(toTimestamp(message.issuedAt), writer.uint32(26).fork()).ldelim();
    }
    if (message.expiresAt !== undefined) {
      Timestamp.encode(toTimestamp(message.expiresAt), writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserAccessToken {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserAccessToken();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.accessToken = reader.string();
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

          message.issuedAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.expiresAt = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UserAccessToken {
    return {
      accessToken: isSet(object.accessToken) ? String(object.accessToken) : "",
      description: isSet(object.description) ? String(object.description) : "",
      issuedAt: isSet(object.issuedAt) ? fromJsonTimestamp(object.issuedAt) : undefined,
      expiresAt: isSet(object.expiresAt) ? fromJsonTimestamp(object.expiresAt) : undefined,
    };
  },

  toJSON(message: UserAccessToken): unknown {
    const obj: any = {};
    message.accessToken !== undefined && (obj.accessToken = message.accessToken);
    message.description !== undefined && (obj.description = message.description);
    message.issuedAt !== undefined && (obj.issuedAt = message.issuedAt.toISOString());
    message.expiresAt !== undefined && (obj.expiresAt = message.expiresAt.toISOString());
    return obj;
  },

  create(base?: DeepPartial<UserAccessToken>): UserAccessToken {
    return UserAccessToken.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<UserAccessToken>): UserAccessToken {
    const message = createBaseUserAccessToken();
    message.accessToken = object.accessToken ?? "";
    message.description = object.description ?? "";
    message.issuedAt = object.issuedAt ?? undefined;
    message.expiresAt = object.expiresAt ?? undefined;
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

function toTimestamp(date: Date): Timestamp {
  const seconds = date.getTime() / 1_000;
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = (t.seconds || 0) * 1_000;
  millis += (t.nanos || 0) / 1_000_000;
  return new Date(millis);
}

function fromJsonTimestamp(o: any): Date {
  if (o instanceof Date) {
    return o;
  } else if (typeof o === "string") {
    return new Date(o);
  } else {
    return fromTimestamp(Timestamp.fromJSON(o));
  }
}

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
