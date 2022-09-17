type ShortcutId = number;

type Visibility = "PRIVATE" | "WORKSPACE" | "PUBLIC";

interface Shortcut {
  id: ShortcutId;

  creatorId: UserId;
  creator: User;
  createdTs: TimeStamp;
  updatedTs: TimeStamp;
  workspaceId: WorkspaceId;
  rowStatus: RowStatus;

  name: string;
  link: string;
  description: string;
  visibility: Visibility;
}

interface ShortcutCreate {
  workspaceId: WorkspaceId;

  name: string;
  link: string;
  description: string;
  visibility: Visibility;
}

interface ShortcutPatch {
  id: ShortcutId;

  name?: string;
  link?: string;
  description?: string;
  visibility?: Visibility;
}

interface ShortcutFind {
  creatorId?: UserId;
  workspaceId?: WorkspaceId;
}
