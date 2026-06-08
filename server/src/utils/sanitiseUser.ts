import { User } from "@prisma/client";

export const sanitiseUser = (user: User) => {
  const { password, ...safeUser } = user;
  return safeUser;
};
