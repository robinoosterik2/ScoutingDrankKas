import { defineEventHandler } from 'h3';
import { User } from '@/server/models/user';

export default defineEventHandler(async () => {
    const users = await User.find();
    return users;
});