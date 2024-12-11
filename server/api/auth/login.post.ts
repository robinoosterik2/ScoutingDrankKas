import { defineEventHandler, readBody } from 'h3';
import { User } from '@/server/models/user';
import { createError } from 'h3';

interface CustomError {
	statusCode?: number;
	statusMessage?: string;
}

interface UserState {
	email: string;
	username: string;
	firstName: string;
	lastName: string;
	password: string;
	loggedInAt: Date;
	role: typeof CustomRole;
}

function isCustomError(error: unknown): error is CustomError {
	return (
		typeof error === "object" &&
		error !== null &&
		("statusCode" in error || "statusMessage" in error)
	);
}

export default defineEventHandler(async (event) => {
  // Validate input
  const body = await readBody(event);
  const { username, password } = body;
  let normalizedUsername = username.toLowerCase();

  // Strict input validation
  if (!normalizedUsername || typeof normalizedUsername !== 'string' || !password || typeof password !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid input: Username and password are required"
    });
  }

  try {
    // Trim username to prevent whitespace-related issues
    const trimmedUsername = normalizedUsername.trim();

    // Find user with a case-insensitive search
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${trimmedUsername}$`, 'i') } 
    });

    // Consistent error response for both non-existent user and incorrect password
    if (!user) {
      throw { statusCode: 401, statusMessage: "User not found" };
    }

    // Verify password using a secure comparison method
    const isPasswordValid = await verifyPassword(user.password, password);
    if (!isPasswordValid) {
      throw { statusCode: 401, statusMessage: "Invalid credentials" };
    }

    // Create user session
    await setUserSession(event, { user, loggedInAt: Date.now() });

    return { 
      statusCode: 200, 
      message: "Login successful",
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        loggedInAt: user.loggedInAt,
        role: user.role
      }
    };

  } catch (error) {
    if (isCustomError(error)) {
      throw createError({ statusCode: error.statusCode, statusMessage: error.statusMessage });
    } else {
      throw createError({ statusCode: 500, statusMessage: "Error logging in" });
    }
  }
});