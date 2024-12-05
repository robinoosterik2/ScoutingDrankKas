import { defineEventHandler, readBody } from 'h3';
import { User } from '@/server/models/user';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    
    const { username, password } = body;

    if (!username || !password) {
        throw createError({ statusCode: 400, statusMessage: "Username and password are required" });
    }

    if (await User.findOne({ username })) {
        throw createError({ statusCode: 400, statusMessage: "Username already exists" });
    }

    if (password.length < 8) {
        throw createError({ statusCode: 400, statusMessage: "Password must be at least 8 characters" });
    }

    try {
        const user = new User({ username, password });
        await user.save();
        await setUserSession(event, { user, loggedInAt: Date.now() });
    } catch (error) {
        throw createError({ statusCode: 500, statusMessage: "Error creating user", data: error });
    }
});
