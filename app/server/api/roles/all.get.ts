import { defineEventHandler } from "h3";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async () => {
  try {
    const customRoles = await prisma.customRole.findMany({ orderBy: { roleName: 'asc' } });
    return customRoles;
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: "Error while fetching custom roles"});
  }
});
