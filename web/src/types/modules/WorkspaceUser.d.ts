type Role = "ADMIN" | "USER";

interface WorkspaceUser {
  workspaceId: WorkspaceId;
  userId: UserId;
  role: Role;
  createdTs: TimeStamp;
  updatedTs: TimeStamp;
  email: string;
  displayName: string;
}

interface WorkspaceUserUpsert {
  workspaceId: WorkspaceId;
  userId: UserId;
  role: Role;
  updatedTs?: TimeStamp;
}

interface WorkspaceUserFind {
  workspaceId: WorkspaceId;
  userId?: UserId;
}

interface WorkspaceUserDelete {
  workspaceId: WorkspaceId;
  userId: UserId;
}
