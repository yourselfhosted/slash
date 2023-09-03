/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "slash.store";

export enum WorkspaceSettingKey {
  WORKSPACE_SETTING_KEY_UNSPECIFIED = 0,
  WORKSPACE_SETTING_AUTO_BACKUP = 1,
  UNRECOGNIZED = -1,
}

export function workspaceSettingKeyFromJSON(object: any): WorkspaceSettingKey {
  switch (object) {
    case 0:
    case "WORKSPACE_SETTING_KEY_UNSPECIFIED":
      return WorkspaceSettingKey.WORKSPACE_SETTING_KEY_UNSPECIFIED;
    case 1:
    case "WORKSPACE_SETTING_AUTO_BACKUP":
      return WorkspaceSettingKey.WORKSPACE_SETTING_AUTO_BACKUP;
    case -1:
    case "UNRECOGNIZED":
    default:
      return WorkspaceSettingKey.UNRECOGNIZED;
  }
}

export function workspaceSettingKeyToJSON(object: WorkspaceSettingKey): string {
  switch (object) {
    case WorkspaceSettingKey.WORKSPACE_SETTING_KEY_UNSPECIFIED:
      return "WORKSPACE_SETTING_KEY_UNSPECIFIED";
    case WorkspaceSettingKey.WORKSPACE_SETTING_AUTO_BACKUP:
      return "WORKSPACE_SETTING_AUTO_BACKUP";
    case WorkspaceSettingKey.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface WorkspaceSetting {
  key: WorkspaceSettingKey;
  autoBackup?: AutoBackupWorkspaceSetting | undefined;
}

export interface AutoBackupWorkspaceSetting {
  /** Whether auto backup is enabled. */
  enabled: boolean;
  /**
   * The cron expression for auto backup.
   * For example, "0 0 0 * * *" means backup at 00:00:00 every day.
   * See https://en.wikipedia.org/wiki/Cron for more details.
   */
  cronExpression: string;
  /** The maximum number of backups to keep. */
  maxKeep: number;
}

function createBaseWorkspaceSetting(): WorkspaceSetting {
  return { key: 0, autoBackup: undefined };
}

export const WorkspaceSetting = {
  encode(message: WorkspaceSetting, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== 0) {
      writer.uint32(8).int32(message.key);
    }
    if (message.autoBackup !== undefined) {
      AutoBackupWorkspaceSetting.encode(message.autoBackup, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WorkspaceSetting {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWorkspaceSetting();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.key = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.autoBackup = AutoBackupWorkspaceSetting.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): WorkspaceSetting {
    return {
      key: isSet(object.key) ? workspaceSettingKeyFromJSON(object.key) : 0,
      autoBackup: isSet(object.autoBackup) ? AutoBackupWorkspaceSetting.fromJSON(object.autoBackup) : undefined,
    };
  },

  toJSON(message: WorkspaceSetting): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = workspaceSettingKeyToJSON(message.key));
    message.autoBackup !== undefined &&
      (obj.autoBackup = message.autoBackup ? AutoBackupWorkspaceSetting.toJSON(message.autoBackup) : undefined);
    return obj;
  },

  create(base?: DeepPartial<WorkspaceSetting>): WorkspaceSetting {
    return WorkspaceSetting.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<WorkspaceSetting>): WorkspaceSetting {
    const message = createBaseWorkspaceSetting();
    message.key = object.key ?? 0;
    message.autoBackup = (object.autoBackup !== undefined && object.autoBackup !== null)
      ? AutoBackupWorkspaceSetting.fromPartial(object.autoBackup)
      : undefined;
    return message;
  },
};

function createBaseAutoBackupWorkspaceSetting(): AutoBackupWorkspaceSetting {
  return { enabled: false, cronExpression: "", maxKeep: 0 };
}

export const AutoBackupWorkspaceSetting = {
  encode(message: AutoBackupWorkspaceSetting, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.enabled === true) {
      writer.uint32(8).bool(message.enabled);
    }
    if (message.cronExpression !== "") {
      writer.uint32(18).string(message.cronExpression);
    }
    if (message.maxKeep !== 0) {
      writer.uint32(24).int32(message.maxKeep);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AutoBackupWorkspaceSetting {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAutoBackupWorkspaceSetting();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.enabled = reader.bool();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.cronExpression = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.maxKeep = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): AutoBackupWorkspaceSetting {
    return {
      enabled: isSet(object.enabled) ? Boolean(object.enabled) : false,
      cronExpression: isSet(object.cronExpression) ? String(object.cronExpression) : "",
      maxKeep: isSet(object.maxKeep) ? Number(object.maxKeep) : 0,
    };
  },

  toJSON(message: AutoBackupWorkspaceSetting): unknown {
    const obj: any = {};
    message.enabled !== undefined && (obj.enabled = message.enabled);
    message.cronExpression !== undefined && (obj.cronExpression = message.cronExpression);
    message.maxKeep !== undefined && (obj.maxKeep = Math.round(message.maxKeep));
    return obj;
  },

  create(base?: DeepPartial<AutoBackupWorkspaceSetting>): AutoBackupWorkspaceSetting {
    return AutoBackupWorkspaceSetting.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<AutoBackupWorkspaceSetting>): AutoBackupWorkspaceSetting {
    const message = createBaseAutoBackupWorkspaceSetting();
    message.enabled = object.enabled ?? false;
    message.cronExpression = object.cronExpression ?? "";
    message.maxKeep = object.maxKeep ?? 0;
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
