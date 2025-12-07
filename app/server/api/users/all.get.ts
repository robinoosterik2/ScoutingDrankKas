import { defineEventHandler } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async () => {
  // Fetch all active users (guests are now users)
  const users = await prisma.user.findMany({
    where: { active: true },
    include: {
      role: true,
      host: true,
    },
    orderBy: { firstName: "asc" },
  });

  const mapped = users.map((u) => {
    // Construct label
    let dropdownLabel = `${u.firstName || ""} ${u.lastName || ""} ${
      u.username
    }`.trim();

    return {
      id: u.id,
      type: u.isGuest ? "guest" : "user",
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.isGuest
        ? { id: "guest", roleName: "Guest" } // Virtual role for guests
        : u.role
        ? { id: u.role.id, roleName: u.role.roleName }
        : null,
      balance: u.balance,
      accountStatus: u.accountStatus,
      dropdownLabel,
      hostName: u.host
        ? u.host.firstName
          ? `${u.host.firstName} ${u.host.lastName || ""}`.trim()
          : u.host.username
        : undefined,
    };
  });

  return mapped.sort((a, b) => {
    const nameA = a.firstName || a.username;
    const nameB = b.firstName || b.username;
    return nameA.localeCompare(nameB);
  });
});
