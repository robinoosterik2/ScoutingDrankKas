import { defineEventHandler, readBody, createError } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const user = await getUserSession(event);

  const body = await readBody(event);
  const { userId } = body;

  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: "missing userId" });
  }

  const userToBeAnonymized = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });
  if (!userToBeAnonymized) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  if (userId == user.id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Cannot anonymize yourself",
    });
  }

  await prisma.user.update({
    where: { id: userToBeAnonymized.id },
    data: {
      username: `anonymized_${Date.now()}`,
      email: `anonymized_${userId}@example.com`,
      firstName: "Anonymized",
      lastName: "Anonymized",
      active: false,
    },
  });

  return { message: "User anonymized successfully" };
});
