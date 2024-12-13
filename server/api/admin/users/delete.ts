import { defineEventHandler, readBody, createError } from 'h3';
import { User } from '@/server/models/user';

export default defineEventHandler(async (event) => {
    const user = await getUserSession(event);

    // Read the request body
    const body = await readBody(event);
    const { userId } = body;

    if (!userId) {
        throw createError({ statusCode: 400, statusMessage: "missing userId"})
    }

    const userToBeDeleted = User.findById(userId)
    if (!userToBeDeleted) {
        throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    if (userId == user._id ) {
        throw createError({ statusCode: 404, statusMessage: "Cannot delete yourself" })
    }

    await User.findByIdAndDelete(userId)
    return { message: "User deleted successfully" }
});