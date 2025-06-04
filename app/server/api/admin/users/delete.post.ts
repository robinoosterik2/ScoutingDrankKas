import { defineEventHandler, readBody, createError, setResponseStatus } from 'h3';
import { User, type UserDocument } from '@/server/models/user'; // Import UserDocument
import mongoose from 'mongoose'; // Import mongoose for ObjectId validation

export default defineEventHandler(async (event) => {
    // Ensure this is a POST request if not relying on file name convention fully
    // However, with `delete.post.ts` this check is less critical.
    // if (event.node.req.method !== 'POST') {
    //   throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
    // }

    try {
        const sessionUser = await getUserSession(event);
        if (!sessionUser || !sessionUser.user) {
            throw createError({ statusCode: 401, statusMessage: "Unauthorized", message: "Authentication required." });
        }

        const body = await readBody(event);
        const { userId } = body;

        // Input Validation: userId is required
        if (!userId) {
            throw createError({
                statusCode: 400,
                statusMessage: "Bad Request",
                message: "User ID is required.",
                data: { errorCode: "VALIDATION_ERROR", details: "userId field missing." }
            });
        }

        // Input Validation: userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw createError({
                statusCode: 400,
                statusMessage: "Bad Request",
                message: "Invalid User ID format.",
                data: { errorCode: "VALIDATION_ERROR", details: "userId must be a valid MongoDB ObjectId." }
            });
        }

        if (userId === sessionUser.user._id) {
            throw createError({
                statusCode: 400,
                statusMessage: "Bad Request",
                message: "Cannot anonymize yourself.",
                data: { errorCode: "SELF_ANONYMIZATION_NOT_ALLOWED" }
            });
        }

        const userToBeAnonymized: UserDocument | null = await User.findById(userId);
        if (!userToBeAnonymized) {
            throw createError({
                statusCode: 404,
                statusMessage: "Not Found",
                message: "User to be anonymized not found.",
                data: { errorCode: "USER_NOT_FOUND" }
            });
        }

        // Anonymization logic
        userToBeAnonymized.username = `anonymized_${Date.now()}`;
        userToBeAnonymized.email = `anonymized_${userId}@example.com`; // Ensure email is unique if required by schema
        userToBeAnonymized.firstName = "Anonymized";
        userToBeAnonymized.lastName = "User"; // Changed from "Anonymized" for slight variation
        userToBeAnonymized.active = false;
        // Consider other fields: clear password, tokens, etc. if they exist and are sensitive.
        // userToBeAnonymized.password = undefined; // If schema allows optional password
        // userToBeAnonymized.resetPasswordToken = undefined;
        // userToBeAnonymized.resetPasswordExpires = undefined;


        await userToBeAnonymized.save();

        setResponseStatus(event, 200); // Explicitly set 200 OK
        return { message: "User anonymized successfully" };

    } catch (error: any) {
        console.error("Error in user anonymization endpoint:", error);

        if (error.statusCode) { // If it's already an H3Error from createError
            throw error;
        }

        // For other unexpected errors (e.g., database connection issues)
        throw createError({
            statusCode: 500,
            statusMessage: "Internal Server Error",
            message: "An unexpected error occurred during user anonymization.",
            // data: { errorCode: 'ANONYMIZATION_FAILED', details: error.message }
        });
    }
});