import { defineEventHandler, readBody, createError } from "h3";
import { prisma } from "~/server/utils/prisma";
import { logAuditEvent } from "~/server/utils/logger";

export default defineEventHandler(async (event) => {
  // Read the request body
  const body = await readBody(event);
  const { id, roleName, roleDescription, rolePermissions } = body;

  // Validate the request body
  if (!id || !roleName || !roleDescription || !rolePermissions) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID, role name, description, and permissions are required",
    });
  }

  // Find and update the custom role
  const role = await prisma.customRole.findUnique({
    where: { id: String(id) },
  });
  if (!role) {
    throw createError({ statusCode: 404, statusMessage: "Role not found" });
  }

  const updatedRole = await prisma.customRole.update({
    where: { id: role.id },
    data: {
      roleName,
      roleDescription,
      rolePermissions: JSON.stringify(rolePermissions),
    },
  });
  await logAuditEvent({
    event,
    action: "role_updated",
    category: "security",
    targetType: "CustomRole",
    targetId: updatedRole.id,
    description: `Updated role ${updatedRole.roleName} (${updatedRole.id}).`,
  });

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
