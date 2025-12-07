import { defineEventHandler, getQuery } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const { userId, limit } = getQuery(event);

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required",
    });
  }
  const user = await prisma.user.findUnique({ where: { id: String(userId) } });
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: Number(limit) || 10,
  });

  return {
    orders: orders.map((order) => ({
      ...order,
      products: order.items.map((item) => ({
        ...item,
        productId: item.product,
      })),
    })),
  };
});
