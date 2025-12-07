import { defineEventHandler, readBody, createError, getRouterParam } from "h3";
import { prisma } from "~/server/utils/prisma";
import { logAuditEvent } from "~/server/utils/logger";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const { email, firstName, lastName, password, confirmPassword, roleId } =
    body;

  if (!id) {
    throw createError({ statusCode: 400, message: "User ID is required" });
  }

  if (!email || !firstName || !lastName || !password || !confirmPassword) {
    throw createError({ statusCode: 400, message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    throw createError({ statusCode: 400, message: "Passwords do not match" });
  }
  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      message: "Password must be at least 8 characters",
    });
  }

  const user = await prisma.user.findUnique({ where: { id: String(id) } });

  if (!user) {
    throw createError({ statusCode: 404, message: "User not found" });
  }

  if (user.accountStatus !== "MIGRATED") {
    throw createError({
      statusCode: 400,
      message: "User is not in MIGRATED status",
    });
  }

  const existingEmail = await prisma.user.findFirst({
    where: {
      email: email.toLowerCase(),
      id: { not: user.id },
    },
  });

  if (existingEmail) {
    throw createError({ statusCode: 400, message: "Email already in use" });
  }

  const hashed = await hashPassword(password);

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      email: email.toLowerCase(),
      firstName,
      lastName,
      password: hashed,
      roleId: roleId || null,
      accountStatus: "ACTIVE",
    },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      accountStatus: true,
      active: true,
      balance: true,
    },
  });

  await logAuditEvent({
    event,
    action: "user_activated",
    category: "user",
    targetType: "User",
    targetId: updatedUser.id,
    description: `Activated user ${updatedUser.username} (${updatedUser.email}).`,
  });

  return updatedUser;
});
