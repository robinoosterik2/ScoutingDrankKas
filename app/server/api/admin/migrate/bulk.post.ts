import { defineEventHandler, readBody, createError } from "h3";
import { prisma } from "~/server/utils/prisma";
import { logAuditEvent } from "~/server/utils/logger";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { users } = body;

  if (!users || !Array.isArray(users) || users.length === 0) {
    throw createError({ statusCode: 400, message: "No users provided" });
  }

  const results = {
    success: [] as any[],
    failed: [] as any[],
  };

  // Process users sequentially to avoid race conditions with DB connections if we had many
  // But strictly speaking, prisma handles pool. We can use Promise.all but for error isolating per user, loop is fine.
  for (const userData of users) {
    const { username, balance, firstName, lastName } = userData;

    if (!username || balance === undefined || balance === null) {
      results.failed.push({ username, reason: "Missing username or balance" });
      continue;
    }

    try {
      const existingUser = await prisma.user.findFirst({
        where: { username: username },
      });

      if (existingUser) {
        results.failed.push({
          username: username,
          reason: "Username already exists",
        });
        continue;
      }

      // Create default settings
      const settings = await prisma.settings.create({
        data: { language: "nl", darkMode: true, speedMode: false },
      });

      const newUser = await prisma.user.create({
        data: {
          username: username,
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
        },
      });

      results.success.push({ username: newUser.username });

      // Log individually or batch log? Individual is safer for audit trail queryability
      await logAuditEvent({
        event,
        action: "user_migrated_bulk",
        category: "user",
        targetType: "User",
        targetId: newUser.id,
        description: `Bulk migrated user ${
          newUser.username
        } with balance ${Number(balance)}.`,
      });
    } catch (error: any) {
      console.error(`Failed to migrate user ${username}`, error);
      results.failed.push({
        username,
        reason: error.message || "Unknown error",
      });
    }
  }

  return results;
});
