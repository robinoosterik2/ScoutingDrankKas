import { defineEventHandler, getQuery, createError } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Number(query.limit ?? 10)); // Allow larger limit by default or infinite? Standardize on 10 or similar.
    const skip = (page - 1) * limit;

    const isPaginationRequested =
      query.page !== undefined || query.limit !== undefined;

    if (!isPaginationRequested) {
      const customRoles = await prisma.customRole.findMany({
        orderBy: { roleName: "asc" },
      });
      return customRoles.map((role) => ({
        ...role,
        rolePermissions: normalizePermissions(role.rolePermissions),
      }));
    }

    const [total, customRoles] = await Promise.all([
      prisma.customRole.count(),
      prisma.customRole.findMany({
        orderBy: { roleName: "asc" },
        skip,
        take: limit,
      }),
    ]);

    const mapped = customRoles.map((role) => ({
      ...role,
      rolePermissions: normalizePermissions(role.rolePermissions),
    }));

    return {
      data: mapped,
      total,
      page,
      limit,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error while fetching custom roles",
    });
  }
});

const normalizePermissions = (permissions: string | string[] | null) => {
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
