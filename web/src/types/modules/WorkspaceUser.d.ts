type Role = "ADMIN" | "USER";

interface WorkspaceUser {
  workspaceId: WorkspaceId;
  userId: UserId;
  user: User;
  role: Role;
  createdTs: TimeStamp;
  updatedTs: TimeStamp;
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
