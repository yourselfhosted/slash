import { Role } from "@/types/proto/api/v2/user_service";

export const convertRoleFromPb = (role: Role): string => {
  if (role === Role.ADMIN) {
    return "Admin";
  } else if (role === Role.USER) {
    return "User";
  } else {
    return "Unknown";
  }
};
