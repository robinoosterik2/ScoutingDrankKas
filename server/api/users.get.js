import { defineEventHandler } from 'h3';
import connectDB from '@/utils/db';
import { User } from '@/server/models/User';

export default defineEventHandler(async () => {
    await connectDB();
    const users = await User.find();
    return users;
});