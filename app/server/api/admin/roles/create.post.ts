import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    const { roleName, roleDescription, rolePermissions } = body;
    if (!roleName || !roleDescription || !rolePermissions) {
        throw createError({ statusCode: 400, statusMessage: "Role name, description, and permissions are required" });
    }
    const role = await prisma.customRole.create({ data: { roleName, roleDescription, rolePermissions: JSON.stringify(rolePermissions) } });

    return {
        message: "Role created successfully",
        role: {
            roleName: role.roleName,
            roleDescription: role.roleDescription,
            rolePermissions: role.rolePermissions,
        },
    };
  });
