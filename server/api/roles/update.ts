import { defineEventHandler, readBody, createError } from 'h3';
import { CustomRole } from '@/server/models/customRole';

export default defineEventHandler(async (event) => {
    // Make sure the user is admin
    const user = await getUserSession(event);
    if (!user || !await isAdministrator(user._id as string)) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    // Read the request body
    const body = await readBody(event);
    const { id, roleName, roleDescription, rolePermissions } = body;

    // Validate the request body
    if (!id || !roleName || !roleDescription || !rolePermissions) {
        throw createError({ statusCode: 400, statusMessage: "ID, role name, description, and permissions are required" });
    }

    // Find and update the custom role
    const role = await CustomRole.findById(id);
    if (!role) {
        throw createError({ statusCode: 404, statusMessage: "Role not found" });
    }

    role.roleName = roleName;
    role.roleDescription = roleDescription;
    role.rolePermissions = rolePermissions;
    await role.save();

    return {
        message: "Role updated successfully",
        role: {
            id: role._id,
            roleName: role.roleName,
            roleDescription: role.roleDescription,
            rolePermissions: role.rolePermissions,
        },
    };
});