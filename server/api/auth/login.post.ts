import { defineEventHandler, readBody } from 'h3';
import { User } from '@/server/models/user';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    
    const { username, password } = body;

    if (!username || !password) {
        throw createError({ statusCode: 400, statusMessage: "Username and password are required" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            throw createError({ statusCode: 404, statusMessage: "User not found" });
        }
        const isPasswordValid = await verifyPassword(user.password, password);
        console.log(isPasswordValid);
        if (!isPasswordValid) {
            throw createError({ statusCode: 401, statusMessage: "Invalid credentials" });
        }
        await setUserSession(event, { user, loggedInAt: Date.now() });
        return { status: 200, statusMessage: "Login successful" };
    } catch (error) {
        throw createError({ statusCode: 500, statusMessage: "Error logging in", data: error });
    }
});
