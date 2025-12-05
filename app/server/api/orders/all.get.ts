import { defineEventHandler } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async () => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        bartender: { select: { id: true, firstName: true, lastName: true } },
        items: { include: { product: { select: { id: true, name: true } } } },
      },
    });
    return orders.map((o) => ({
      id: o.id,
      _id: String(o.id),
      user: o.user,
      bartender: o.bartender,
      products: o.items.map((it) => ({
        productId: {
          id: it.product.id,
          _id: String(it.product.id),
          name: it.product.name,
        },
        count: it.count,
      })),
      total: o.total,
      createdAt: o.createdAt,
    }));
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error while fetching orders",
    });
  }
});
