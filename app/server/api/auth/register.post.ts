import { defineEventHandler, readBody } from "h3";
import { prisma } from "~/server/utils/prisma";
import { logAuditEvent } from "~/server/utils/logger";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { username, email, firstName, lastName, password, confirmPassword } =
    body;
  const normalizedUsername = username.toLowerCase();
  const normalizedEmail = email.toLowerCase();
  const normalizedFirstName = firstName.toLowerCase();
  const normalizedLastName = lastName.toLowerCase();

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Username and password are required",
    });
  }

  if (
    await prisma.user.findFirst({ where: { username: normalizedUsername } })
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Username already exists",
    });
  }

  if (await prisma.user.findFirst({ where: { email: normalizedEmail } })) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email already exists",
    });
  }

  if (
    await prisma.user.findFirst({
      where: { firstName: normalizedFirstName, lastName: normalizedLastName },
    })
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "User already has an account",
    });
  }

  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password must be at least 8 characters",
    });
  }

  if (password !== confirmPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: "Passwords do not match",
    });
  }

  try {
    const hashed = await hashPassword(password);
    const settings = await prisma.settings.create({
      data: { language: "nl", darkMode: true, speedMode: false },
    });
    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        password: hashed,
        settingsId: settings.id,
        active: true,
      },
    });
    await setUserSession(event, {
      user: {
        id: user.id,
        _id: String(user.id),
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      loggedInAt: Date.now(),
    });
    await logAuditEvent({
      event,
      executorId: user.id,
      action: "user_created",
      category: "user",
      targetType: "User",
      targetId: user.id,
      description: `Registered new user ${user.username} (${user.email}).`,
    });
    return {
      message: "User created successfully",
      user: {
        username: normalizedUsername,
        email: normalizedEmail,
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
      },
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error creating user",
      data: error,
    });
  }
});
