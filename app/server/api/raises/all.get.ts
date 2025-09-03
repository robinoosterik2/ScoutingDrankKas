import { defineEventHandler } from "h3";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async () => {
  try {
    const raises = await prisma.raise.findMany({ orderBy: { createdAt: 'desc' } });
    return raises;
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: "Error while fetching custom roles"});
  }
});
