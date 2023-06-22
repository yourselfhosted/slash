type ShortcutId = number;

type Visibility = "PRIVATE" | "WORKSPACE" | "PUBLIC";

interface Shortcut {
  id: ShortcutId;

  creatorId: UserId;
  creator: User;
  createdTs: TimeStamp;
  updatedTs: TimeStamp;
  rowStatus: RowStatus;

  name: string;
  link: string;
  description: string;
  visibility: Visibility;
}

interface ShortcutCreate {
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
}
