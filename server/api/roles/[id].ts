import { defineEventHandler, readBody } from 'h3';
import { CustomRole } from '@/server/models/customRole';

export default defineEventHandler(async (event) => {
    const { id } = event.context.params || {};

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: "Role ID is required" });
    }

    try {
        const role = await CustomRole.findById(id);
        if (!role) {
            throw createError({ statusCode: 404, statusMessage: "Role not found" });
        }

        return role;
    } catch (error) {
        throw createError({ statusCode: 500, statusMessage: "Error while fetching custom role"});
    }
});