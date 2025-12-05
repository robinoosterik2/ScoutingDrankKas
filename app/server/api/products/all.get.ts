import { defineEventHandler } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async () => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });
    return products;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error while fetching custom roles",
    });
  }
});
