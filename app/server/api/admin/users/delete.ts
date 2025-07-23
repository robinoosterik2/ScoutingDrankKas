import { defineEventHandler, readBody, createError } from "h3";
import User from "@/server/models/user";

export default defineEventHandler(async (event) => {
  const user = await getUserSession(event);

  const body = await readBody(event);
  const { userId } = body;

  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: "missing userId" });
  }

  const userToBeAnonymized = await User.findById(userId);
  if (!userToBeAnonymized) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  if (userId == user.id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Cannot anonymize yourself",
    });
  }

  userToBeAnonymized.username = `anonymized_${Date.now()}`;
  userToBeAnonymized.email = `anonymized_${userId}@example.com`;
  userToBeAnonymized.firstName = "Anonymized";
  userToBeAnonymized.lastName = "Anonymized";
  userToBeAnonymized.active = false;

  await userToBeAnonymized.save();

  return { message: "User anonymized successfully" };
});
