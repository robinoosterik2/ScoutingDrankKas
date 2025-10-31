import prisma from "~/server/utils/prisma";
import { logAuditEvent } from "~/server/utils/logger";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    const { roleName, roleDescription, rolePermissions } = body;
    if (!roleName || !roleDescription || !rolePermissions) {
        throw createError({ statusCode: 400, statusMessage: "Role name, description, and permissions are required" });
    }
    const role = await prisma.customRole.create({ data: { roleName, roleDescription, rolePermissions: JSON.stringify(rolePermissions) } });
    await logAuditEvent({
        event,
        action: "role_created",
        category: "security",
        targetType: "CustomRole",
        targetId: role.id,
        description: `Created role ${role.roleName} (${role.id}).`,
    });

    return {
        message: "Role created successfully",
        role: {
            roleName: role.roleName,
            roleDescription: role.roleDescription,
            rolePermissions: role.rolePermissions,
        },
    };
  });
