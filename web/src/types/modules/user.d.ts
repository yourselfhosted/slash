type UserId = number;

interface User {
  id: UserId;

  createdTs: TimeStamp;
  updatedTs: TimeStamp;
  rowStatus: RowStatus;

  email: string;
  displayName: string;
  openId: string;
}

interface UserCreate {
  email: string;
  password: string;
  displayName: string;
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
