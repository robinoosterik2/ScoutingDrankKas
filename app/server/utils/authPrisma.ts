import { prisma } from "@/server/utils/prisma";

export async function hasPermission(
  userId: number | string,
  permission: string
): Promise<boolean> {
  const id = String(userId);
  if (!id) return false;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!user || !user.role) return false;
  const raw = user.role.rolePermissions || "[]";
  try {
    const perms = JSON.parse(raw) as string[];
    return Array.isArray(perms) && perms.includes(permission);
  } catch {
    return false;
  }
}

export async function isStam(userId: number | string) {
  return hasPermission(userId, "stam");
}

export async function findUserByUsername(username: string) {
  // We store usernames in lowercase; normalize input accordingly
  const normalized = username.toLowerCase();
  return prisma.user.findFirst({ where: { username: normalized } });
}
