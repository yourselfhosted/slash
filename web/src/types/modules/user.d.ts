type UserId = number;

interface User {
  id: UserId;

  createdTs: TimeStamp;
  updatedTs: TimeStamp;
  rowStatus: RowStatus;

  email: string;
  name: string;
}

interface UserCreate {
  email: string;
  password: string;
  name: string;
}

interface UserPatch {
  id: UserId;

  rowStatus?: RowStatus;

  name?: string;
  password?: string;
}

interface UserDelete {
  id: UserId;
}
