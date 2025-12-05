import { defineEventHandler, createError } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  // Extract order id from route params
  const { id } = event.context.params || {};

  if (!id) {
    throw createError({ statusCode: 400, message: "Order ID is required" });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        bartender: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, price: true } },
          },
        },
      },
    });
    if (!order) {
      throw createError({ statusCode: 404, message: "Order not found" });
    }
    return {
      id: order.id,
      _id: String(order.id),
      user: order.user,
      bartender: order.bartender,
      products: order.items.map((it) => ({
        productId: {
          id: it.product.id,
          _id: String(it.product.id),
          name: it.product.name,
          price: it.product.price,
        },
        count: it.count,
      })),
      total: order.total,
      createdAt: order.createdAt,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error retrieving order " + error,
    });
  }
});
