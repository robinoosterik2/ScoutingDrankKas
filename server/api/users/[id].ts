import { defineEventHandler } from 'h3';
import { User } from '@/server/models/user';

export default defineEventHandler(async (event) => {
    const { id } = event.context.params || {};

    if (!id) {
        throw new Error("User ID is required");
    }

    const user = await User.findById(id)

    if (!user) {
        throw new Error("User not found");
    }

    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
    };
});
