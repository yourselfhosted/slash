type ShortcutId = number;

type Visibility = "PRIVATE" | "WORKSPACE" | "PUBLIC";

interface OpenGraphMetadata {
  title: string;
  description: string;
  image: string;
}

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
  openGraphMetadata: OpenGraphMetadata;
  view: number;
}

interface ShortcutCreate {
  name: string;
  link: string;
  description: string;
  visibility: Visibility;
  tags: string[];
  openGraphMetadata: OpenGraphMetadata;
}

interface ShortcutPatch {
  id: ShortcutId;

  name?: string;
  link?: string;
  description?: string;
  visibility?: Visibility;
  tags?: string[];
  openGraphMetadata?: OpenGraphMetadata;
}

interface ShortcutFind {
  tag?: string;
}
