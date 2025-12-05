import { defineEventHandler } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {};

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "User ID is required",
    });
  }

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        roleId: true,
      },
    });
  } catch (dbError) {
    console.error(
      `Database error in /api/users/[id] while fetching user with ID "${id}":`,
      dbError
    );
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "An error occurred while fetching the user data.",
    });
  }

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `User with ID "${id}" not found.`,
    });
  }

  return user;
});
