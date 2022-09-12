type ShortcutId = number;

type Visibility = "PRIVATE" | "WORKSPACE";

interface Shortcut {
  id: ShortcutId;

  creatorId: UserId;
  createdTs: TimeStamp;
  updatedTs: TimeStamp;
  workspaceId: WorkspaceId;
  rowStatus: RowStatus;

  name: string;
  link: string;
  visibility: Visibility;
}

interface ShortcutCreate {
  workspaceId: WorkspaceId;

  name: string;
  link: string;
  visibility: Visibility;
}

interface ShortcutPatch {
  id: ShortcutId;

  name?: string;
  link?: string;
  visibility?: Visibility;
}

interface ShortcutFind {
  creatorId?: UserId;
  workspaceId?: WorkspaceId;
}
