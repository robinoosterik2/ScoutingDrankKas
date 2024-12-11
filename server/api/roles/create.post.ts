import { CustomRole } from '@/server/models/customRole';

export default defineEventHandler(async (event) => {
    // make sure the user is admin
    // const user = await getUserSession(event);
    // if (!user || !await isAdministrator(user._id as string)) {
    //     throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    // }

    // Clear the current user session
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