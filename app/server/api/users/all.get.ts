import { defineEventHandler } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async () => {
  const users = await prisma.user.findMany({
    where: { active: true },
    include: { role: true },
    orderBy: { firstName: "asc" },
  });
  return users.map((u) => ({
    id: u.id,
    _id: String(u.id),
    username: u.username,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role ? { id: u.role.id, roleName: u.role.roleName } : null,
    balance: u.balance,
  }));
});
