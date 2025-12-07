import { defineEventHandler, readBody, createError } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  // Read the request body
  const body = await readBody(event);
  const { roleId } = body;

  // Validate the request body
  if (!roleId) {
    throw createError({ statusCode: 400, statusMessage: "ID is required" });
  }

  // Find and delete the custom role
  const role = await prisma.customRole.findUnique({
    where: { id: String(roleId) },
  });
  if (!role) {
    throw createError({ statusCode: 404, statusMessage: "Role not found" });
  }

  await prisma.customRole.delete({ where: { id: String(roleId) } });
  return { message: "Role deleted successfully" };
});
