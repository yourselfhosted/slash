type WorkspaceId = number;

interface Workspace {
  id: WorkspaceId;

  creatorId: UserId;
  createdTs: TimeStamp;
  updatedTs: TimeStamp;
  rowStatus: RowStatus;

  name: string;
  description: string;
}

interface WorkspaceCreate {
  name: string;
  description: string;
}

interface WorkspacePatch {
  id: WorkspaceId;
  rowStatus?: RowStatus;
  name?: string;
  description?: string;
}

interface WorkspaceFind {
  creatorId?: UserId;
  memberId?: UserId;
}
