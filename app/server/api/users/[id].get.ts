import { defineEventHandler, createError } from 'h3'; // Added createError
import { User, UserDocument, isAdministrator, PopulatedRole } from '@/server/models/user'; // Added UserDocument, isAdministrator, PopulatedRole
import mongoose from 'mongoose';

export default defineEventHandler(async (event) => {
    const authenticatedUserSession = await getUserSession(event); // From nuxt-auth-utils

    if (!authenticatedUserSession || !authenticatedUserSession.user) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized",
            message: "Authentication is required to access this resource.",
        });
    }

    // Cast session user to a more specific type if possible, or ensure it has necessary fields
    const sessionAuthUser = authenticatedUserSession.user as { _id: string, role?: string | PopulatedRole /* other fields from session */ };

    const targetUserId = event.context.params?.id;

    // 1. Check if ID is provided
    if (!targetUserId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request",
            message: "User ID is required",
        });
    }

    // 2. Validate if the ID is a valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request",
            message: `Invalid User ID format: "${targetUserId}". A valid ObjectId is expected.`,
        });
    }

    // Authorization Logic
    let isAllowed = false;
    if (sessionAuthUser._id === targetUserId) {
        isAllowed = true; // User is requesting their own profile
    } else {
        // Fetch the full authenticated user document to check admin status reliably
        const fullAuthenticatedUser = await User.findById(sessionAuthUser._id).populate('role');
        if (fullAuthenticatedUser && isAdministrator(fullAuthenticatedUser)) {
            isAllowed = true; // User is an admin
        }
    }

    if (!isAllowed) {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden",
            message: "You do not have permission to access this resource.",
        });
    }

    // 3. Attempt to find the target user by ID
    let targetUser;
    try {
        // .select('-password') ensures the password hash is not returned
        targetUser = await User.findById(targetUserId).select('-password').populate('role').lean<UserDocument>();
    } catch (dbError: any) {
        console.error(`Database error in /api/users/[id].get while fetching user with ID "${targetUserId}":`, dbError);
        throw createError({
            statusCode: 500,
            statusMessage: "Internal Server Error",
            message: "An error occurred while fetching the user data.",
        });
    }

    // 4. Check if user was found
    if (!targetUser) {
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found",
            message: `User with ID "${targetUserId}" not found.`,
        });
    }

    // 5. Return the user data (ensure it's transformed if needed, e.g. role object)
    // .lean<UserDocument>() should give a plain object matching UserDocument structure.
    // The role should be populated due to .populate('role').
    return {
        _id: targetUser._id,
        username: targetUser.username,
        email: targetUser.email,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        role: targetUser.role, // This will be the populated role object or null
        balance: targetUser.balance.toString(), // Assuming balance getter from UserDocument
        active: targetUser.active,
        createdAt: targetUser.createdAt,
        updatedAt: targetUser.updatedAt,
        // Add other non-sensitive fields as needed
    };
});