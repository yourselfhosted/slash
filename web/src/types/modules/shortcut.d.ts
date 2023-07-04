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
  tags: string[];
  view: number;
}

interface ShortcutCreate {
  name: string;
  link: string;
  description: string;
  visibility: Visibility;
  tags: string[];
}

interface ShortcutPatch {
  id: ShortcutId;

  name?: string;
  link?: string;
  description?: string;
  visibility?: Visibility;
  tags?: string[];
}

interface ShortcutFind {
  tag?: string;
}
