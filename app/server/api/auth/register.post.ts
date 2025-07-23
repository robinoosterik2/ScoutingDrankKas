import { defineEventHandler, readBody } from "h3";
import User from "@/server/models/user";

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

  if (await User.findOne({ username: normalizedUsername })) {
    throw createError({
      statusCode: 400,
      statusMessage: "Username already exists",
    });
  }

  if (await User.findOne({ email: normalizedEmail })) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email already exists",
    });
  }

  if (
    await User.findOne({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
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
    const user = new User({
      username: normalizedUsername,
      email: normalizedEmail,
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      password: password,
    });
    await user.save();
    await setUserSession(event, { user, loggedInAt: Date.now() });
    return {
      message: "User created successfully",
      user: {
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
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
