import { hasPermission } from "~/server/utils/authPrisma";

export async function isAdmin(params: any): Promise<boolean> {
  const id = params?.id ?? params?._id;
  return hasPermission(id, 'admin');
}
