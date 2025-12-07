import { hasPermission } from "~/server/utils/authPrisma";

export async function isAdmin(params: any): Promise<boolean> {
  const id = params?.id;
  return hasPermission(id, "admin");
}
