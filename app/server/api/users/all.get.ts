import { defineEventHandler } from "h3";
import { User, type UserDocument } from "@/server/models/user"; // Import UserDocument for typing

export default defineEventHandler(async (event) => {
  try {
    const users = await User.find({ active: true })
      .populate("role")
      .lean<UserDocument[]>(); // Use .lean() for better performance if not modifying docs, and type the result

    if (!users) {
      // This case might not be hit if User.find returns [] for no matches,
      // but good practice if it could return null.
      throw createError({
        statusCode: 404,
        statusMessage: "Users not found",
      });
    }

    return users.map((user) => ({
      // Ensure the returned object structure matches what frontend expects
      // and UserDocument fields.
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role, // Role should be populated
      balance: user.balance.toString(), // Ensure balance is string if getter not applied by lean()
      active: user.active, // Make sure to return all necessary fields
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  } catch (error: any) {
    // Log the detailed error for server-side review
    console.error("Error fetching all users:", error);

    // Use H3's createError to throw a standardized error response
    // If error is already an H3Error, re-throw it or handle specifically
    if (error.statusCode) { // Check if it's already an H3Error (has statusCode)
        throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "An unexpected error occurred while fetching users.",
      // Optionally add error.data for more specific info if appropriate
      // data: { errorCode: 'USER_FETCH_FAILED', details: error.message }
    });
  }
});
