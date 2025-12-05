import { defineEventHandler, getQuery } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const userId = query.userId as string | undefined;

    const recentOrders = await prisma.order.findMany({
      where: userId ? { userId: Number(userId) } : undefined,
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, price: true } },
          },
        },
      },
    });

    // Map to legacy shape expected by UI
    const mapped = recentOrders.map((o) => ({
      _id: String(o.id),
      id: o.id,
      user: {
        _id: String(o.user.id),
        id: o.user.id,
        firstName: o.user.firstName,
        lastName: o.user.lastName,
      },
      products: o.items.map((it) => ({
        productId: {
          _id: String(it.product.id),
          id: it.product.id,
          name: it.product.name,
          price: it.product.price,
        },
        count: it.count,
      })),
      createdAt: o.createdAt,
      total: o.total,
    }));

    return { orders: mapped };
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch recent orders",
    });
  }
});
