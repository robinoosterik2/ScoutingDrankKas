import { defineEventHandler, readBody } from 'h3';
import { User } from '@/server/models/user';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    
    const { username } = body;

    if (!username) {
        throw createError({ statusCode: 400, statusMessage: "Username is required" });
    }

    try {
        const user = await User.findOne({ username });
        return user;
    } catch (error) {
        throw createError({ statusCode: 500, statusMessage: "Error getting user", data: error });
    }
});
