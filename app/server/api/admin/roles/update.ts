import { defineEventHandler, readBody, createError } from 'h3';
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
    // Read the request body
    const body = await readBody(event);
    const { id, roleName, roleDescription, rolePermissions } = body;

    // Validate the request body
    if (!id || !roleName || !roleDescription || !rolePermissions) {
        throw createError({ statusCode: 400, statusMessage: "ID, role name, description, and permissions are required" });
    }

    // Find and update the custom role
    const role = await prisma.customRole.findUnique({ where: { id: Number(id) } });
    if (!role) {
        throw createError({ statusCode: 404, statusMessage: "Role not found" });
    }

    await prisma.customRole.update({ where: { id: role.id }, data: { roleName, roleDescription, rolePermissions: JSON.stringify(rolePermissions) } });

    return {
        message: "Role updated successfully",
        role: {
            id: role.id,
            roleName,
            roleDescription,
            rolePermissions,
        },
    };
});
