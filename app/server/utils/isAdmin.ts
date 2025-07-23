import User from "@/server/models/user";

export async function isAdmin(params: any): Promise<boolean> {
  const user = await User.findById(params._id).populate("role");
  if (!user) {
    return false;
  }
  const role = user.role;
  if (!role) {
    return false;
  }
  if (role.rolePermissions.includes("admin")) {
    return true;
  }
  return false;
}
