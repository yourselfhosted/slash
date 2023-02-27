type WorkspaceId = number;

interface Workspace {
  id: WorkspaceId;

  creatorId: UserId;
  createdTs: TimeStamp;
  updatedTs: TimeStamp;
  rowStatus: RowStatus;

  name: string;
  title: string;
  description: string;

  workspaceUserList: WorkspaceUser[];
}

interface WorkspaceCreate {
  name: string;
  title: string;
  description: string;
}

interface WorkspacePatch {
  id: WorkspaceId;
  rowStatus?: RowStatus;
  name?: string;
  title?: string;
  description?: string;
}

interface WorkspaceFind {
  creatorId?: UserId;
  memberId?: UserId;
}
