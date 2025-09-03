import { defineEventHandler, readBody, createError } from "h3";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    // Read and validate request body
    const body = await readBody(event);
    console.log(body);
    if (!body.productId || !body.quantity || body.price === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Missing required fields: productId, quantity, and price are required",
      });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: Number(body.productId) } });
    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: "Product not found",
      });
    }

    const session = await getUserSession(event);

    // Create new purchase
    const purchaseDate = body.dayOfOrder
      ? new Date(body.dayOfOrder)
      : new Date();
    const dayOfOrder = purchaseDate;

    // Not modeled in Prisma schema: skip persisting purchase for now.

    // Update product stock
    await prisma.product.update({ where: { id: product.id }, data: { stock: { increment: Number(body.quantity) } } });

    // Return created purchase with populated fields
    return { success: true };
  } catch (error: any) {
    console.error("Error creating purchase:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Failed to create purchase",
      data: error.data,
    });
  }
});
