type UserId = number;

type Role = "ADMIN" | "USER";

interface User {
  id: UserId;

  createdTs: TimeStamp;
  updatedTs: TimeStamp;
  rowStatus: RowStatus;

  username: string;
  nickname: string;
  email: string;
  role: Role;
}

interface UserPatch {
  id: UserId;

  rowStatus?: RowStatus;
  displayName?: string;
  password?: string;
  resetOpenId?: boolean;
}

interface UserDelete {
  id: UserId;
}
