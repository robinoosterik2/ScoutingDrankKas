import { defineEventHandler } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return categories;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error while fetching custom roles",
    });
  }
});
