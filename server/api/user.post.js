import { defineEventHandler, readBody } from 'h3';
import connectDB from '@/utils/db';
import { User } from '@/server/models/User';

export default defineEventHandler(async (event) => {
    await connectDB();
    const body = await readBody(event);
    
    const { username, password } = body;

    if (!username || !password) {
        throw createError({ statusCode: 400, statusMessage: "Username and password are required" });
    }

    try {
        const user = new User({ username, password });
        await user.save();
        return { message: 'User created successfully', user };
    } catch (error) {
        throw createError({ statusCode: 500, statusMessage: "Error creating user", data: error });
    }
});
