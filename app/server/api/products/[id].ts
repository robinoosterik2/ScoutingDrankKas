import { defineEventHandler } from "h3";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {};

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Product ID is required",
    });
  }

  const product = await prisma.product.findUnique({ where: { id: Number(id) }, include: { categories: true } });
  if (!product) {
    throw createError({ statusCode: 400, statusMessage: "Product not found" });
  }

  return product;
});
