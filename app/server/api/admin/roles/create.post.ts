import { CustomRole } from '@/server/models/customRole';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    const { roleName, roleDescription, rolePermissions } = body;
    if (!roleName || !roleDescription || !rolePermissions) {
        throw createError({ statusCode: 400, statusMessage: "Role name, description, and permissions are required" });
    }
    const role = new CustomRole({roleName, roleDescription, rolePermissions});
    await role.save();

    return {
        message: "Role created successfully",
        role: {
            roleName: role.roleName,
            roleDescription: role.roleDescription,
            rolePermissions: role.rolePermissions,
        },
    };
  });