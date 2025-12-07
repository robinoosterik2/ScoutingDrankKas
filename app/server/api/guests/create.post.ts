import { defineEventHandler, readBody, createError } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const body = await readBody(event);
  const { username, firstName, lastName } = body;

  if (!username) {
    throw createError({ statusCode: 400, message: "Username is required" });
  }

  // Check for uniqueness in User table
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUser) {
    throw createError({
      statusCode: 400,
      message: "Username already exists",
    });
  }

  try {
    const guest = await prisma.user.create({
      data: {
        username,
        firstName,
        lastName,
        isGuest: true,
        hostId: String(session.user.id),
        accountStatus: "GUEST",
        // Password is optional in schema, so we can omit it or set null
        password: null,
      },
    });

    return guest;
  } catch (error) {
    console.error("Failed to create guest:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to create guest account",
    });
  }
});
