import { defineEventHandler, createError } from "h3";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async () => {
  try {
    const customRoles = await prisma.customRole.findMany({
      orderBy: { roleName: "asc" },
    });

    return customRoles.map((role) => ({
      ...role,
      rolePermissions: normalizePermissions(role.rolePermissions),
    }));
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error while fetching custom roles",
    });
  }
});

const normalizePermissions = (permissions) => {
  if (Array.isArray(permissions)) return permissions;
  if (typeof permissions === "string" && permissions.trim().length > 0) {
    try {
      const parsed = JSON.parse(permissions);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to parse role permissions", error);
    }
  }
  return [];
};
