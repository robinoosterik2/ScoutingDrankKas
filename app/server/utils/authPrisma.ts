import { prisma } from "@/server/utils/prisma";

export async function hasPermission(
  userId: number | string,
  permission: string,
): Promise<boolean> {
  const id = String(userId);
  if (!id) return false;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
  if (!user || !user.role) return false;
  const raw = user.role.rolePermissions || "[]";
  let perms: string[];
  try {
    const parsed = JSON.parse(raw);
    perms = Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    perms = raw.split(",").map((p) => p.trim());
  }

  // If the user has the 'admin' permission, we can choose to grant all access or just what they asked.
  // We'll keep the logic simple: if the requested permission is present.
  return Array.isArray(perms) && perms.includes(permission);
}

export async function isStam(userId: number | string) {
  return hasPermission(userId, "stam");
}

export async function findUserByUsername(username: string) {
  // We store usernames in lowercase; normalize input accordingly
  const normalized = username.toLowerCase();
  return prisma.user.findFirst({ where: { username: normalized } });
}
