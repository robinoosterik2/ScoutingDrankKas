import { defineEventHandler, readBody, createError } from "h3";
import { prisma } from "~/server/utils/prisma";
import { logAuditEvent } from "~/server/utils/logger";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, balance, firstName, lastName } = body;

  if (!username) {
    throw createError({ statusCode: 400, message: "Username is required" });
  }
  if (balance === undefined || balance === null) {
    throw createError({ statusCode: 400, message: "Balance is required" });
  }

  const normalizedUsername = username.toLowerCase();

  const existingUser = await prisma.user.findFirst({
    where: { username: normalizedUsername },
  });

  if (existingUser) {
    throw createError({ statusCode: 400, message: "Username already exists" });
  }

  try {
    // Create default settings
    const settings = await prisma.settings.create({
      data: { language: "nl", darkMode: true, speedMode: false },
    });

    const newUser = await prisma.user.create({
      data: {
        username: normalizedUsername,
        balance: Number(balance),
        firstName: firstName || null,
        lastName: lastName || null,
        accountStatus: "MIGRATED",
        active: true,
        settingsId: settings.id,
      },
      select: {
        id: true,
        username: true,
        balance: true,
        accountStatus: true,
        active: true,
        createdAt: true,
      },
    });

    await logAuditEvent({
      event,
      action: "user_migrated",
      category: "user",
      targetType: "User",
      targetId: newUser.id,
      description: `Migrated user ${newUser.username} with balance ${newUser.balance}.`,
    });

    return newUser;
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      message: "Failed to create migrated user",
    });
  }
});
