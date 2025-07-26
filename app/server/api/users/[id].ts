import { defineEventHandler } from "h3";
import User from "@/server/models/user";

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
    user = await User.findById(id).select("-password");
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

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
});
