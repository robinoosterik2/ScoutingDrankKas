import { defineEventHandler, readBody } from 'h3';
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
    const { id } = event.context.params || {};

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: "Role ID is required" });
    }

    try {
        const role = await prisma.customRole.findUnique({ where: { id: Number(id) } });
        if (!role) {
            throw createError({ statusCode: 404, statusMessage: "Role not found" });
        }

        return role;
    } catch (error) {
        throw createError({ statusCode: 500, statusMessage: "Error while fetching custom role"});
    }
});
