import { defineEventHandler } from 'h3';
import { User } from '@/server/models/user';
import mongoose from 'mongoose'; // Ensure mongoose is imported

export default defineEventHandler(async (event) => {
    const { id } = event.context.params || {};

    // 1. Check if ID is provided
    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request",
            message: "User ID is required",
        });
    }

    // 2. Validate if the ID is a valid MongoDB ObjectId format
    // This is crucial to prevent the CastError if a non-ObjectId string (like "balance") is passed.
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request",
            message: `Invalid User ID format: "${id}". A valid ObjectId is expected.`,
        });
    }

    // 3. Attempt to find the user by ID
    let user;
    try {
        // .select('-password') ensures the password hash is not returned
        user = await User.findById(id).select('-password');
    } catch (dbError: any) {
        // Log the actual database error for server-side debugging
        console.error(`Database error in /api/users/[id] while fetching user with ID "${id}":`, dbError);
        throw createError({
            statusCode: 500,
            statusMessage: "Internal Server Error",
            message: "An error occurred while fetching the user data.",
        });
    }

    // 4. Check if user was found
    if (!user) {
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found",
            message: `User with ID "${id}" not found.`,
        });
    }

    // 5. Return the user data
    // Ensure the returned fields match your User model and frontend expectations.
    // Assuming 'roles' is an array of strings on your User model.
    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles, // Ensure this field exists and is named correctly on your User model
        // Include other non-sensitive fields as needed
    };
});