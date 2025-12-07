import { defineEventHandler, readBody, createError } from "h3";
import { hasPermission, findUserByUsername } from "~/server/utils/authPrisma";

interface CustomError {
  statusCode?: number;
  statusMessage?: string;
  message?: string;
  data?: any;
}

function isCustomError(error: unknown): error is CustomError {
  return (
    typeof error === "object" &&
    error !== null &&
    ("statusCode" in error || "statusMessage" in error || "message" in error)
  );
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;
  const normalizedUsername = username.toLowerCase();

  if (
    !normalizedUsername ||
    typeof normalizedUsername !== "string" ||
    !password ||
    typeof password !== "string"
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid input: Username and password are required",
    });
  }

  try {
    const user = await findUserByUsername(normalizedUsername);
    if (!user) {
      throw { statusCode: 401, statusMessage: "User not found" };
    }

    if (user.accountStatus === "MIGRATED") {
      throw {
        statusCode: 403,
        statusMessage: "account_activation_required",
        message: "account_activation_required",
        data: { requiresActivation: true },
      };
    }

    if (!user.password) {
      throw { statusCode: 401, statusMessage: "Invalid credentials" };
    }

    const isPasswordValid = await verifyPassword(user.password, password);
    if (!isPasswordValid) {
      throw { statusCode: 401, statusMessage: "Invalid credentials" };
    }

    const [isAdmin, isStam] = await Promise.all([
      hasPermission(user.id, "admin"),
      hasPermission(user.id, "stam"),
    ]);

    if (body.rememberMe) {
      await setUserSession(
        event,
        {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
          },
          loggedInAt: Date.now(),
          isAdmin,
          isStam,
          permissions: {
            admin: isAdmin,
            stam: isStam,
          },
        },
        { maxAge: 60 * 60 * 24 * 30 }
      );
    } else {
      await setUserSession(
        event,
        {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
          },
          loggedInAt: Date.now(),
          isAdmin,
          isStam,
          permissions: {
            admin: isAdmin,
            stam: isStam,
          },
        },
        { maxAge: 60 * 10 }
      );
    }
    return {
      statusCode: 200,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        loggedInAt: user.loggedInAt,
        role: undefined,
        permissions: {
          admin: isAdmin,
          stam: isStam,
        },
      },
    };
  } catch (error) {
    if (isCustomError(error)) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.statusMessage || error.message,
        data: error.data,
      });
    } else {
      throw createError({ statusCode: 500, statusMessage: "Error logging in" });
    }
  }
});
