import { defineEventHandler, readBody, createError } from 'h3';
import { CustomRole } from '@/server/models/customRole';

export default defineEventHandler(async (event) => {
    // Read the request body
    const body = await readBody(event);
    const { roleId } = body;

    // Validate the request body
    if (!roleId) {
        throw createError({ statusCode: 400, statusMessage: "ID is required" });
    }

    // Find and delete the custom role
    const role = await CustomRole.findById(roleId);
    if (!role) {
        throw createError({ statusCode: 404, statusMessage: "Role not found" });
    }

    await CustomRole.findByIdAndDelete(roleId);
    return { message: "Role deleted successfully" };
    
});