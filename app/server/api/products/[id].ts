import { defineEventHandler } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {};

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Product ID is required",
    });
  }

  /* const productId = Number.parseInt(String(id), 10);
  if (Number.isNaN(productId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Product ID must be a number",
    });
  } */

  const product = await prisma.product.findUnique({
    where: { id: String(id) },
    include: { categories: true },
  });
  if (!product) {
    throw createError({ statusCode: 400, statusMessage: "Product not found" });
  }
  console.log(product);
  return product;
});
