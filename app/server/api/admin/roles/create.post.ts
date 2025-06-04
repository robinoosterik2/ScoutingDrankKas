import { defineEventHandler, readBody, createError } from 'h3'; // Ensure createError is imported
import { defineEventHandler, readBody, createError } from 'h3'; // Ensure createError is imported
import { CustomRole } from '@/server/models/customRole';

/**
 * Array of predefined valid permission strings for role creation.
 * Used to validate the `rolePermissions` input.
 */
const VALID_PERMISSIONS = ['admin', 'stam', 'manage_users', 'manage_products', 'view_logs'];

/**
 * Handles the HTTP POST request to create a new custom role.
 * Expects a request body containing `roleName`, `roleDescription`, and `rolePermissions`.
 * Performs validation on these inputs:
 * - `roleName`: Required, string, length between 3 and 50 characters.
 * - `roleDescription`: Required, string.
 * - `rolePermissions`: Required, array of strings; each permission must be in `VALID_PERMISSIONS`.
 *                     The array cannot be empty. Duplicate permissions are removed.
 *
 * Access to this endpoint should be restricted to administrators via routing middleware.
 *
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<object>} An object containing a success message and the created role data.
 * @throws {H3Error} Throws an H3Error (via `createError`) for validation failures (400)
 *                   or unexpected server errors (500).
 */
export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { roleName, roleDescription, rolePermissions } = body;

        // --- roleName Validation ---
        if (!roleName || typeof roleName !== 'string') {
            throw createError({
                statusCode: 400,
                statusMessage: "Bad Request",
                message: "Role name is required and must be a string.",
                data: { errorCode: "VALIDATION_ERROR", details: "roleName is required." }
            });
        }
        if (roleName.length < 3 || roleName.length > 50) {
            throw createError({
                statusCode: 400,
                statusMessage: "Bad Request",
                message: "Role name must be between 3 and 50 characters.",
                data: { errorCode: "VALIDATION_ERROR", details: `roleName length: ${roleName.length}` }
            });
        }
        // Optional: Add character set validation for roleName if needed.
        // Optional: Uniqueness check for roleName would require a database query:
        // const existingRole = await CustomRole.findOne({ roleName });
        // if (existingRole) {
        //   throw createError({ statusCode: 409, statusMessage: "Conflict", message: "Role name already exists." });
        // }

        // --- roleDescription Validation (basic presence) ---
        if (!roleDescription || typeof roleDescription !== 'string') { // Assuming description is required
            throw createError({
                statusCode: 400,
                statusMessage: "Bad Request",
                message: "Role description is required and must be a string.",
                data: { errorCode: "VALIDATION_ERROR", details: "roleDescription is required." }
            });
        }
        // Optional: Add length validation for roleDescription if needed.

        // --- rolePermissions Validation ---
        if (!rolePermissions) {
            throw createError({
                statusCode: 400,
                statusMessage: "Bad Request",
                message: "Role permissions are required.",
                data: { errorCode: "VALIDATION_ERROR", details: "rolePermissions is required." }
            });
        }
        if (!Array.isArray(rolePermissions)) {
            throw createError({
                statusCode: 400,
                statusMessage: "Bad Request",
                message: "Role permissions must be an array.",
                data: { errorCode: "VALIDATION_ERROR", details: "rolePermissions must be an array." }
            });
        }
        if (rolePermissions.length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: "Bad Request",
                message: "Role permissions array cannot be empty.",
                data: { errorCode: "VALIDATION_ERROR", details: "rolePermissions cannot be empty." }
            });
        }
        for (const perm of rolePermissions) {
            if (typeof perm !== 'string' || !VALID_PERMISSIONS.includes(perm)) {
                throw createError({
                    statusCode: 400,
                    statusMessage: "Bad Request",
                    message: `Invalid permission: '${perm}'. Valid permissions are: ${VALID_PERMISSIONS.join(', ')}.`,
                    data: { errorCode: "VALIDATION_ERROR_INVALID_PERMISSION", details: `Invalid permission: ${perm}` }
                });
            }
        }
        // Remove duplicate permissions before saving
        const uniqueRolePermissions = [...new Set(rolePermissions)];

        const role = new CustomRole({ roleName, roleDescription, rolePermissions: uniqueRolePermissions });
        await role.save();

        return {
            message: "Role created successfully",
            role: {
                _id: role._id, // Include _id in response
                roleName: role.roleName,
                roleDescription: role.roleDescription,
                rolePermissions: role.rolePermissions,
            },
        };
    } catch (error: any) {
        console.error("Error creating role:", error);
        // Re-throw H3Errors, otherwise handle as internal server error
        if (error.statusCode) { // H3Error has statusCode
            throw error;
        }
        throw createError({
            statusCode: 500,
            statusMessage: "Internal Server Error",
            message: "An unexpected error occurred while creating the role.",
        });
    }
});